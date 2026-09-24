"use client";

import React, { useEffect, useRef, useState } from "react";
import { Shield, Eye, EyeOff, Zap, UserPlus, LogIn } from "lucide-react";
import { useAuth, AuthError } from "@/hooks/useAuth";
import { DEMO_PERSONAS, ROLE_ACCENT } from "@/config/roles";
import "./auth.css";

const TABS = [
  { id: "demo",     label: "Instant Demo",   icon: Zap },
  { id: "signin",   label: "Sign In",         icon: LogIn },
  { id: "register", label: "Register",        icon: UserPlus },
];

const PERSONA_SCOPE = {
  signer:    ["Document Signing", "Simulation Studio", "Batch Runner", "Logs"],
  verifier:  ["Signature Verification", "Experiment Logs"],
  adversary: ["Attack Lab", "Experiment Logs"],
  admin:     ["Threat Analytics", "All Views", "Full Access"],
};

export default function AuthModal() {
  const { login, loginDemo, register } = useAuth();
  const [tab, setTab] = useState("demo");
  const [loadingCard, setLoadingCard] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const firstFocusRef = useRef(null);

  useEffect(() => { firstFocusRef.current?.focus(); }, [tab]);

  function clearMessages() { setError(null); setSuccess(null); }

  async function handlePersonaClick(persona) {
    clearMessages();
    setLoadingCard(persona.username);
    try {
      if (typeof loginDemo === "function") {
        loginDemo(persona);
      } else {
        await login(persona.username, persona.password);
      }
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

        {/* Ambient glow orbs */}
        <div className="auth-orb auth-orb-cyan" aria-hidden="true" />
        <div className="auth-orb auth-orb-purple" aria-hidden="true" />

        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <div className="auth-logo-ring">
              <div className="auth-logo-inner">
                <Shield className="auth-logo-icon" />
              </div>
            </div>
            <div className="auth-logo-pulse" />
          </div>
          <div>
            <div className="auth-brand-row">
              <span className="auth-brand-name">Q-SHIELD</span>
              <span className="auth-brand-badge">SIH26141</span>
            </div>
            <p className="auth-brand-sub">Quantum Digital Signature Framework</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          {TABS.map((t, i) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`auth-tab${tab === t.id ? " active" : ""}`}
                onClick={() => { setTab(t.id); clearMessages(); }}
                ref={i === 0 ? firstFocusRef : null}
              >
                <Icon className="auth-tab-icon" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="auth-body">
          {error && (
            <div className={`auth-error ${error.kind}`} role="alert">
              <span className="auth-msg-icon">
                {error.kind === "network" ? "⚠️" : error.kind === "server" ? "🔴" : "🔒"}
              </span>
              {error.msg}
            </div>
          )}
          {success && (
            <div className="auth-success" role="status">
              <span className="auth-msg-icon">✅</span>
              {success}
            </div>
          )}

          {/* Demo Personas */}
          {tab === "demo" && (
            <div>
              <p className="auth-personas-hint">
                One-click login as a demo persona. Each role unlocks a distinct set of views.
              </p>
              <div className="persona-grid">
                {DEMO_PERSONAS.map((p) => {
                  const accent = ROLE_ACCENT[p.role];
                  const isLoading = loadingCard === p.username;
                  const scope = PERSONA_SCOPE[p.role] ?? [];
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
                      <span className="persona-border-sweep" aria-hidden="true" />

                      <div className="persona-top">
                        <span className="persona-icon-wrap" style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
                          <span className="persona-icon">{p.icon}</span>
                        </span>
                        <div className="persona-header-text">
                          <span className="persona-name">{p.displayName}</span>
                          <span className="persona-role-badge" style={{ color: accent.color, background: accent.bg, border: `1px solid ${accent.border}` }}>
                            {accent.label}
                          </span>
                        </div>
                      </div>

                      <p className="persona-tagline">{p.tagline}</p>

                      <div className="persona-scope">
                        {scope.map((s) => (
                          <span key={s} className="persona-scope-tag" style={{ color: accent.color, background: accent.bg }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="persona-cta" style={{ color: accent.color }}>
                        {isLoading ? "Authenticating…" : "Enter as " + p.displayName + " →"}
                      </div>

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

          {/* Sign In */}
          {tab === "signin" && (
            <form className="auth-form" onSubmit={handleSignIn} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="si-username">Username</label>
                <input id="si-username" name="username" className="auth-input" type="text"
                  autoComplete="username" required placeholder="e.g. alice" ref={firstFocusRef} />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="si-password">Password</label>
                <div className="auth-input-wrap">
                  <input id="si-password" name="password" className="auth-input" type={showPw ? "text" : "password"}
                    autoComplete="current-password" required placeholder="••••••••" />
                  <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button className="auth-submit" type="submit" disabled={formLoading}>
                {formLoading ? <><span className="btn-spinner" />Signing in…</> : "Sign In"}
              </button>
              <p className="auth-switch-hint">
                No account? <button type="button" className="auth-link" onClick={() => { setTab("register"); clearMessages(); }}>Create one</button>
              </p>
            </form>
          )}

          {/* Create Account */}
          {tab === "register" && (
            <form className="auth-form" onSubmit={handleRegister} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-username">Username</label>
                <input id="reg-username" name="username" className="auth-input" type="text"
                  autoComplete="username" required minLength={3} maxLength={50} ref={firstFocusRef} />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-email">Email</label>
                <input id="reg-email" name="email" className="auth-input" type="email"
                  autoComplete="email" required />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-password">Password</label>
                <div className="auth-input-wrap">
                  <input id="reg-password" name="password" className="auth-input" type={showConfirm ? "text" : "password"}
                    autoComplete="new-password" required minLength={8} maxLength={72} />
                  <button type="button" className="auth-eye" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle password">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                <input id="reg-confirm" name="confirm" className="auth-input" type="password"
                  autoComplete="new-password" required />
              </div>
              <button className="auth-submit" type="submit" disabled={formLoading}>
                {formLoading ? <><span className="btn-spinner" />Creating account…</> : "Create Account"}
              </button>
              <p className="auth-note">
                Public accounts are created with the <strong>Verifier</strong> role only.
              </p>
              <p className="auth-switch-hint">
                Already have an account? <button type="button" className="auth-link" onClick={() => { setTab("signin"); clearMessages(); }}>Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
