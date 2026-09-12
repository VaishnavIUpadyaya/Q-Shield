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

/** Decode JWT exp without a library (base64url → JSON). */
function getTokenExp(token) {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json.exp ?? null; // seconds since epoch
  } catch {
    return null;
  }
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

  /** Validate a token against /auth/me and hydrate state. */
  const hydrateFromToken = useCallback(async (tok) => {
    try {
      const me = await apiGetMe(tok);
      setToken(tok);
      setUser(me);
      scheduleExpiry(tok);
    } catch {
      // Token invalid or expired — clear it
      localStorage.removeItem(TOKEN_KEY);
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

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password);
    // data: {access_token, token_type, user: {user_id, username, email, role}}
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    scheduleExpiry(data.access_token);
    return data.user;
  }, [scheduleExpiry]);

  const register = useCallback(async (username, email, password) => {
    // Returns UserResponse; does not issue a token — user must log in after.
    return apiRegister(username, email, password);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
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
