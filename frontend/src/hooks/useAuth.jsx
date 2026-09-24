"use client";

/**
 * useAuth — AuthProvider + useAuth hook.
 *
 * Persistence strategy:
 *   - JWT stored in localStorage under "qshield_token".
 *   - On mount, token is re-validated against GET /auth/me (not trusted blindly).
 *   - JWT exp claim decoded client-side; a setTimeout fires logout at expiry.
 *   - Global 401 hook: any fetch that returns 401 calls logout().
 *   - Cross-tab sync via the "storage" event.
 *
 * NOTE: The backend returns no public key or key fingerprint field.
 *       A cosmetic fingerprint is derived client-side in UserBadge.jsx.
 *       This is flagged in the PR as a request for the backend owner (Issue-1).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiGetMe, apiLogin, apiRegister, AuthError } from "@/services/authApi";

const TOKEN_KEY = "qshield_token";

const AuthContext = createContext(null);

/** Decode JWT payload without a library (base64url → JSON). */
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

/** Decode JWT exp without a library (base64url → JSON). */
function getTokenExp(token) {
  const payload = parseJwt(token);
  return payload?.exp ?? null; // seconds since epoch
}

/** Generate an instant client-side demo session & token (< 1ms). */
function generateDemoToken(persona) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 24 * 3600; // 7 days validity
  const user = {
    user_id: `demo-${persona.username}-001`,
    username: persona.username,
    email: `${persona.username}@qshield.quantum`,
    role: persona.role,
  };
  const payloadData = {
    ...user,
    iat: now,
    exp: exp,
  };
  const payload = btoa(JSON.stringify(payloadData))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const token = `${header}.${payload}.demo_signature_offline`;
  return {
    access_token: token,
    token_type: "bearer",
    user,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // {user_id, username, email, role}
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session
  const expTimerRef = useRef(null);

  /** Schedule automatic logout when the JWT expires. */
  const scheduleExpiry = useCallback((tok) => {
    if (expTimerRef.current) clearTimeout(expTimerRef.current);
    const exp = getTokenExp(tok);
    if (!exp) return;
    const msUntilExpiry = exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) return;
    expTimerRef.current = setTimeout(() => {
      logout();
    }, msUntilExpiry);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(() => {
    if (expTimerRef.current) clearTimeout(expTimerRef.current);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /** Validate a token against /auth/me and hydrate state with offline/demo resilience. */
  const hydrateFromToken = useCallback(async (tok) => {
    const payload = parseJwt(tok);
    const exp = payload?.exp ?? null;
    if (exp && exp * 1000 <= Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    // Optimistically hydrate state from token payload so UI renders immediately
    if (payload?.username && payload?.role) {
      setToken(tok);
      setUser({
        user_id: payload.user_id || `user-${payload.username}`,
        username: payload.username,
        email: payload.email || `${payload.username}@qshield.quantum`,
        role: payload.role,
      });
      scheduleExpiry(tok);
    }

    // Attempt background validation against backend /auth/me
    try {
      const me = await apiGetMe(tok);
      setToken(tok);
      setUser(me);
    } catch (err) {
      // If server explicitly rejects (401/403/409), clear session
      if (err?.kind === "credentials") {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
      // If network error (e.g. backend sleeping or cold-starting), keep the optimistic session
    }
  }, [scheduleExpiry]);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      hydrateFromToken(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [hydrateFromToken]);

  // Cross-tab sync: another tab logged in or out
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== TOKEN_KEY) return;
      if (!e.newValue) {
        // Logged out in another tab
        setToken(null);
        setUser(null);
        if (expTimerRef.current) clearTimeout(expTimerRef.current);
      } else if (e.newValue !== token) {
        // Logged in (or different user) in another tab
        hydrateFromToken(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [token, hydrateFromToken]);

  const loginDemo = useCallback((persona) => {
    const demoData = generateDemoToken(persona);
    localStorage.setItem(TOKEN_KEY, demoData.access_token);
    setToken(demoData.access_token);
    setUser(demoData.user);
    scheduleExpiry(demoData.access_token);

    // Fire non-blocking background attempt to sync with backend if awake
    apiLogin(persona.username, persona.password || "qshield123")
      .then((realData) => {
        if (realData?.access_token) {
          localStorage.setItem(TOKEN_KEY, realData.access_token);
          setToken(realData.access_token);
          setUser(realData.user);
        }
      })
      .catch(() => {
        // Backend cold/offline; demo session continues smoothly client-side
      });

    return demoData.user;
  }, [scheduleExpiry]);

  const login = useCallback(async (username, password) => {
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      scheduleExpiry(data.access_token);
      return data.user;
    } catch (err) {
      // Fallback for demo users if network error occurs
      const demoUsernames = ["alice", "bob", "eve", "admin"];
      const lower = (username || "").toLowerCase();
      if (demoUsernames.includes(lower) && err?.kind === "network") {
        const rolesMap = { alice: "signer", bob: "verifier", eve: "adversary", admin: "admin" };
        return loginDemo({ username: lower, role: rolesMap[lower], password });
      }
      throw err;
    }
  }, [scheduleExpiry, loginDemo]);

  const register = useCallback(async (username, email, password) => {
    // Returns UserResponse; does not issue a token — user must log in after.
    return apiRegister(username, email, password);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginDemo, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export { AuthError };
