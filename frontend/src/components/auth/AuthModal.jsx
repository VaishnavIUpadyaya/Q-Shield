"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth, AuthError } from "@/hooks/useAuth";
import { DEMO_PERSONAS, ROLE_ACCENT } from "@/config/roles";
import "./auth.css";

const TABS = [
  { id: "demo",     label: "Demo Personas" },
  { id: "signin",   label: "Sign In" },
  { id: "register", label: "Create Account" },
];

export default function AuthModal() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState("demo");
  const [loadingCard, setLoadingCard] = useState(null); // persona username
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);   // {msg, kind}
  const [success, setSuccess] = useState(null);
  const firstFocusRef = useRef(null);

  // Trap focus inside modal; close on Escape is handled by parent (no dismiss here —
  // the modal is the auth gate and cannot be dismissed without logging in).
  useEffect(() => {
    firstFocusRef.current?.focus();
  }, [tab]);

  function clearMessages() { setError(null); setSuccess(null); }

  async function handlePersonaClick(persona) {
    clearMessages();
    setLoadingCard(persona.username);
    try {
      await login(persona.username, persona.password);
      // AuthProvider sets user; page.jsx will unmount this modal.
    } catch (e) {
      setError({ msg: e.message, kind: e instanceof AuthError ? e.kind : "network" });
      setLoadingCard(null);
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    clearMessages();
    const fd = new FormData(e.target);
    setFormLoading(true);
    try {
      await login(fd.get("username"), fd.get("password"));
    } catch (e) {
      setError({ msg: e.message, kind: e instanceof AuthError ? e.kind : "network" });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    clearMessages();
    const fd = new FormData(e.target);
    if (fd.get("password") !== fd.get("confirm")) {
      setError({ msg: "Passwords do not match.", kind: "credentials" });
      return;
    }
    setFormLoading(true);
    try {
      await register(fd.get("username"), fd.get("email"), fd.get("password"));
      setSuccess("Account created. You can now sign in.");
      setTab("signin");
      e.target.reset();
    } catch (e) {
      setError({ msg: e.message, kind: e instanceof AuthError ? e.kind : "network" });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="Q-Shield Authentication">
      <div className="auth-modal">
        {/* Header */}
        <div style={{ padding: "1.5rem 1.75rem 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.125rem", color: "#f1f5f9", fontFamily: "'Space Grotesk', sans-serif" }}>
                Q-SHIELD
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Quantum Digital Signature Framework
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`auth-tab${tab === t.id ? " active" : ""}`}
              onClick={() => { setTab(t.id); clearMessages(); }}
              ref={i === 0 ? firstFocusRef : null}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="auth-body">
          {error && (
            <div className={`auth-error ${error.kind}`} role="alert" style={{ marginBottom: "1rem" }}>
              {error.kind === "network" && "⚠️ "}
              {error.kind === "server"  && "🔴 "}
              {error.kind === "credentials" && "🔒 "}
              {error.msg}
            </div>
          )}
          {success && (
            <div className="auth-success" role="status" style={{ marginBottom: "1rem" }}>
              ✅ {success}
            </div>
          )}

          {/* ── Demo Personas ── */}
          {tab === "demo" && (
            <div>
              <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1rem" }}>
                One-click login as a demo persona. Each has a distinct role and access scope.
              </p>
              <div className="persona-grid">
                {DEMO_PERSONAS.map((p) => {
                  const accent = ROLE_ACCENT[p.role];
                  const isLoading = loadingCard === p.username;
                  return (
                    <button
                      key={p.username}
                      className={`persona-card${isLoading ? " loading" : ""}`}
                      style={{
                        "--accent-color":  accent.color,
                        "--accent-border": accent.border,
                        "--accent-glow":   accent.glow,
                        "--accent-bg":     accent.bg,
                      }}
                      onClick={() => handlePersonaClick(p)}
                      disabled={loadingCard !== null}
                      aria-label={`Log in as ${p.displayName} (${accent.label})`}
                      aria-busy={isLoading}
                    >
                      <span className="persona-icon">{p.icon}</span>
                      <span className="persona-name">{p.displayName}</span>
                      <span className="persona-tagline">{p.tagline}</span>
                      <p className="persona-desc">{p.description}</p>
                      {isLoading && (
                        <div className="persona-spinner" aria-hidden="true">
                          <div className="spinner-ring" style={{ "--accent-color": accent.color }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Sign In ── */}
          {tab === "signin" && (
            <form className="auth-form" onSubmit={handleSignIn} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="si-username">Username</label>
                <input
                  id="si-username"
                  name="username"
                  className="auth-input"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="e.g. alice"
                  ref={firstFocusRef}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="si-password">Password</label>
                <input
                  id="si-password"
                  name="password"
                  className="auth-input"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
              </div>
              <button className="auth-submit" type="submit" disabled={formLoading}>
                {formLoading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          {/* ── Create Account ── */}
          {tab === "register" && (
            <form className="auth-form" onSubmit={handleRegister} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  name="username"
                  className="auth-input"
                  type="text"
                  autoComplete="username"
                  required
                  minLength={3}
                  maxLength={50}
                  ref={firstFocusRef}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  name="email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  className="auth-input"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  name="confirm"
                  className="auth-input"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button className="auth-submit" type="submit" disabled={formLoading}>
                {formLoading ? "Creating account…" : "Create Account"}
              </button>
              <p className="auth-note">
                Public accounts are created with the <strong>Verifier</strong> role only.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
