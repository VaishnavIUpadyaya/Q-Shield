"use client";

/**
 * UserBadge — shows the authenticated user's identity in the Navbar.
 * RoleGate  — wraps views; blocks access if the user's role isn't permitted.
 *
 * KEY LIMITATION (flagged for backend owner / Issue-1):
 *   The backend /auth/login and /auth/me responses contain no public key or
 *   key fingerprint field. The fingerprint shown here is a COSMETIC value
 *   derived client-side from user_id + username using a simple djb2 hash.
 *   It is NOT real Table-1 QDS key material and must NOT be treated as such.
 *   Request: add a `public_key_fingerprint` field to UserResponse in schemas.py.
 */

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_ACCENT, canAccess } from "@/config/roles";
import "../auth/auth.css";

/** Cosmetic fingerprint — djb2 hash of user_id+username, hex-formatted. */
function cosmeticFingerprint(userId, username) {
  const s = `${userId}:${username}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
    h = h >>> 0; // keep unsigned 32-bit
  }
  // Format as 4-byte hex groups: XX:XX:XX:XX
  const hex = h.toString(16).padStart(8, "0").toUpperCase();
  return `${hex.slice(0,2)}:${hex.slice(2,4)}:${hex.slice(4,6)}:${hex.slice(6,8)}`;
}

const PERSONA_ICON = { signer: "✍️", verifier: "🔍", adversary: "⚡", admin: "🛡️" };

export default function UserBadge() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const accent = ROLE_ACCENT[user.role] ?? ROLE_ACCENT.verifier;
  // COSMETIC fingerprint — not real QDS key material (see file header)
  const fp = cosmeticFingerprint(user.user_id, user.username);

  return (
    <div
      className="user-badge"
      style={{
        "--accent-color":  accent.color,
        "--accent-border": accent.border,
        "--accent-glow":   accent.glow,
        "--accent-bg":     accent.bg,
      }}
    >
      <div className="badge-avatar" aria-hidden="true">
        {PERSONA_ICON[user.role] ?? "👤"}
      </div>
      <div className="badge-info">
        <span className="badge-name">{user.username}</span>
        <span className="badge-role">{accent.label}</span>
        {/* COSMETIC — not real key material */}
        <span className="badge-fingerprint" title="Cosmetic ID — not real QDS key material">
          {fp}
        </span>
      </div>
      <button
        className="badge-signout"
        onClick={logout}
        aria-label="Sign out"
        title="Sign out"
      >
        Sign out
      </button>
    </div>
  );
}

/**
 * RoleGate — renders children only if the current user's role is in the
 * allowed list for `viewId`. Otherwise shows a denied message.
 *
 * CLIENT-SIDE GATING IS UX ONLY — it does not replace backend RBAC.
 * The backend enforces real access control on every API call.
 */
export function RoleGate({ viewId, children }) {
  const { user } = useAuth();
  if (!user) return null;

  if (canAccess(user.role, viewId)) return children;

  const accent = ROLE_ACCENT[user.role] ?? ROLE_ACCENT.verifier;
  return (
    <div className="role-gate-denied">
      <span className="denied-icon">🔒</span>
      <span className="denied-title">Access Restricted</span>
      <p className="denied-msg" style={{ color: accent.color }}>
        The <strong>{accent.label}</strong> role does not have permission to access this view.
        {/* CLIENT-SIDE GATE — backend enforces real RBAC */}
      </p>
    </div>
  );
}
