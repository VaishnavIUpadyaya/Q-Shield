/**
 * Single source of truth for role metadata, demo personas, and view permissions.
 * Adding a new view = one entry in VIEW_PERMISSIONS.
 * NOTE: Client-side gating is UX convenience only, not a security boundary.
 *       The backend enforces real access control on every API call.
 */

export const ROLES = {
  SIGNER: "signer",
  VERIFIER: "verifier",
  ADMIN: "admin",
  ADVERSARY: "adversary",
};

/** Per-role accent colours (Tailwind arbitrary values + CSS vars) */
export const ROLE_ACCENT = {
  signer: {
    label: "Signer",
    color: "#00F2FE",       // quantum-cyan
    border: "rgba(0,242,254,0.35)",
    glow: "rgba(0,242,254,0.18)",
    bg: "rgba(0,242,254,0.08)",
    tailwindText: "text-cyan-400",
    tailwindBorder: "border-cyan-500/40",
    tailwindBg: "bg-cyan-500/10",
  },
  verifier: {
    label: "Verifier",
    color: "#10B981",       // quantum-emerald
    border: "rgba(16,185,129,0.35)",
    glow: "rgba(16,185,129,0.18)",
    bg: "rgba(16,185,129,0.08)",
    tailwindText: "text-emerald-400",
    tailwindBorder: "border-emerald-500/40",
    tailwindBg: "bg-emerald-500/10",
  },
  admin: {
    label: "Admin",
    color: "#A855F7",       // quantum-purple
    border: "rgba(168,85,247,0.35)",
    glow: "rgba(168,85,247,0.18)",
    bg: "rgba(168,85,247,0.08)",
    tailwindText: "text-purple-400",
    tailwindBorder: "border-purple-500/40",
    tailwindBg: "bg-purple-500/10",
  },
  adversary: {
    label: "Adversary",
    color: "#F43F5E",       // quantum-rose
    border: "rgba(244,63,94,0.35)",
    glow: "rgba(244,63,94,0.18)",
    bg: "rgba(244,63,94,0.08)",
    tailwindText: "text-rose-400",
    tailwindBorder: "border-rose-500/40",
    tailwindBg: "bg-rose-500/10",
  },
};

/**
 * Demo persona catalogue.
 * Passwords come from backend/services/auth_service.py DEMO_PASSWORDS.
 */
export const DEMO_PERSONAS = [
  { username: "alice", password: "qshield123", role: "signer",    displayName: "Alice", tagline: "Quantum Signer",       icon: "✍️" },
  { username: "bob",   password: "qshield123", role: "verifier",  displayName: "Bob",   tagline: "Signature Verifier",  icon: "🔍" },
  { username: "eve",   password: "qshield123", role: "adversary", displayName: "Eve",   tagline: "Adversary",           icon: "⚡" },
  { username: "admin", password: "qshield123", role: "admin",     displayName: "Admin", tagline: "Security Admin",      icon: "🛡️" },
];

/**
 * Maps view tab IDs to the roles that may access them.
 * Adding a new view: add one entry here. Nothing else changes.
 * REMINDER: This is UX gating only — the backend enforces real RBAC.
 */
export const VIEW_PERMISSIONS = {
  overview:   ["signer", "verifier", "admin", "adversary"],
  documents:  ["signer", "verifier", "admin", "adversary"],
  simulation: ["signer"],
  batch:      ["signer", "admin"],
  threats:    ["admin"],
  history:    ["signer", "verifier", "admin", "adversary"],
  // adversary attack lab — tab owned by Issue-5, not created here
  // attacks: ["adversary"],
};

/** Returns true if the given role can access the given view. */
export function canAccess(role, viewId) {
  const allowed = VIEW_PERMISSIONS[viewId];
  if (!allowed) return false;
  return allowed.includes(role);
}
