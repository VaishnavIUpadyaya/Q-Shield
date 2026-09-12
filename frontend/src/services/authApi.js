/**
 * Auth API service.
 * Wraps the three /auth endpoints with consistent error normalisation.
 *
 * Contract (verified against backend/routers/auth.py):
 *   POST /auth/login    — JSON {username, password}
 *                         → {access_token, token_type, user: {user_id, username, email, role}}
 *   POST /auth/register — JSON {username, email, password, role}
 *                         → {user_id, username, email, role}
 *   GET  /auth/me       — Bearer token → {user_id, username, email, role}
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/** Normalise FastAPI error responses into a plain string. */
function extractDetail(body) {
  if (!body) return "Unknown error";
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) {
    // Pydantic validation errors: [{loc, msg, type}, ...]
    return body.detail.map((e) => e.msg || JSON.stringify(e)).join("; ");
  }
  return JSON.stringify(body);
}

/**
 * Three distinguishable error classes surfaced to the UI:
 *   "credentials" — 401 / 403 / 409
 *   "server"      — 5xx
 *   "network"     — fetch threw (backend unreachable)
 */
export class AuthError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind; // "credentials" | "server" | "network"
  }
}

async function authFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new AuthError(
      "Cannot reach the Q-Shield API. Is the backend running?",
      "network"
    );
  }

  if (res.ok) return res.json();

  let body = null;
  try { body = await res.json(); } catch { /* empty body */ }

  const detail = extractDetail(body);

  if (res.status === 401 || res.status === 403 || res.status === 409) {
    throw new AuthError(detail, "credentials");
  }
  if (res.status >= 500) {
    throw new AuthError(`Server error (${res.status}): ${detail}`, "server");
  }
  throw new AuthError(detail, "credentials");
}

/** Attach stored JWT to a request. Used by other services (not auth itself). */
export function withAuth(headers = {}) {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("qshield_token")
    : null;
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

export async function apiLogin(username, password) {
  return authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  // Returns: {access_token, token_type, user: {user_id, username, email, role}}
}

export async function apiRegister(username, email, password) {
  // NOTE: /auth/register calls Firestore (create_user in auth_service.py).
  // Without GOOGLE_APPLICATION_CREDENTIALS configured, the backend crashes
  // the request before sending any HTTP response, so fetch() throws a network
  // error. We catch that specific case and surface a clear message.
  try {
    return await authFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, role: "verifier" }),
    });
  } catch (e) {
    if (e.kind === "network") {
      throw new AuthError(
        "Registration requires Firebase/Firestore to be configured on the backend. Use a Demo Persona to log in instead.",
        "server"
      );
    }
    throw e;
  }
}

export async function apiGetMe(token) {
  return authFetch("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Returns: {user_id, username, email, role}
}
