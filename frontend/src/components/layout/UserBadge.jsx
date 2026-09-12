"use client";

/**
 * RoleGate — renders children only if the current user's role is permitted
 * for the given viewId, as defined in roles.js VIEW_PERMISSIONS.
 *
 * CLIENT-SIDE GATING IS UX ONLY — it does not replace backend RBAC.
 * The backend enforces real access control on every API call.
 */

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_ACCENT, canAccess } from "@/config/roles";
import "../auth/auth.css";

export default function UserBadge() {
  // Badge is now rendered inline inside Navbar.jsx.
  // This component is kept as a no-op export so any future import doesn't break.
  return null;
}

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
