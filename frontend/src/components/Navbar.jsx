"use client";

import React, { useState } from "react";
import {
  Shield, ShieldAlert, Cpu, FlaskConical,
  BarChart3, History, Sparkles, LogOut,
  ChevronDown, User, FileCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { canAccess, ROLE_ACCENT } from "@/config/roles";

/* ── per-role icon map ─────────────────────────────────────── */
const ROLE_ICON = { signer: "✍️", verifier: "🔍", adversary: "⚡", admin: "🛡️" };

/* ── cosmetic fingerprint (same djb2 as UserBadge) ─────────── */
function fp(userId, username) {
  const s = `${userId}:${username}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; }
  const x = h.toString(16).padStart(8, "0").toUpperCase();
  return `${x.slice(0,2)}:${x.slice(2,4)}:${x.slice(4,6)}:${x.slice(6,8)}`;
}

export default function Navbar({ activeTab, setActiveTab, backendStatus, onQuickRun }) {
  const { user, logout } = useAuth();
  const [badgeOpen, setBadgeOpen] = useState(false);

  const allNavItems = [
    { id: "overview",   label: "Dashboard",        icon: BarChart3 },
    { id: "documents",  label: "Doc Studio",       icon: FileCheck },
    { id: "simulation", label: "Sim Studio",        icon: Cpu },
    { id: "batch",      label: "Batch",             icon: FlaskConical },
    { id: "threats",    label: "Threat Analytics",  icon: ShieldAlert },
    { id: "history",    label: "Logs",              icon: History },
  ];

  const navItems = user
    ? allNavItems.filter((item) => canAccess(user.role, item.id))
    : allNavItems;

  const accent = user ? ROLE_ACCENT[user.role] : null;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.08] bg-obsidian-950/80 backdrop-blur-2xl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Main row ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 h-16 lg:h-18">

          {/* Brand */}
          <button
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-3 shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quantum-cyan via-quantum-indigo to-quantum-purple p-[1px] shadow-quantum-glow transition-all hover:scale-105">
                <div className="w-full h-full rounded-[11px] bg-obsidian-900 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-quantum-cyan" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-quantum-cyan rounded-full border-2 border-obsidian-950 animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-wider text-white leading-none">
                  Q-SHIELD
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase bg-cyan-500/10 text-quantum-cyan border border-cyan-500/30">
                  SIH26141
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide leading-none mt-0.5">
                QDS Threat Detection Engine
              </p>
            </div>
          </button>

          {/* Nav tabs — desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-obsidian-900/90 p-1 rounded-2xl border border-white/[0.06] mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                  }`}
                  style={isActive && accent ? {
                    borderColor: accent.border,
                    boxShadow: `0 0 10px -2px ${accent.glow}`,
                  } : {}}
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: isActive && accent ? accent.color : undefined }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 ml-auto shrink-0">

            {/* Backend status pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900/90 border border-white/[0.08] text-xs">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                backendStatus.online
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-amber-400 animate-pulse"
              }`} />
              <span className="font-mono font-semibold text-slate-300 whitespace-nowrap">
                {backendStatus.online ? "QISKIT LIVE" : "OFFLINE"}
              </span>
            </div>

            {/* Identity badge — dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setBadgeOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  style={{
                    borderColor: accent?.border ?? "rgba(255,255,255,0.1)",
                    background: accent?.bg ?? "rgba(255,255,255,0.04)",
                    boxShadow: `0 0 16px -4px ${accent?.glow ?? "transparent"}`,
                  }}
                  aria-haspopup="true"
                  aria-expanded={badgeOpen}
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <span className="text-base leading-none">{ROLE_ICON[user.role] ?? "👤"}</span>
                  {/* Name + role — hidden on very small screens */}
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-sm font-bold text-slate-100">{user.username}</span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: accent?.color ?? "#94a3b8" }}
                    >
                      {accent?.label ?? user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
                    style={{ transform: badgeOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {/* Dropdown panel */}
                {badgeOpen && (
                  <>
                    {/* Click-away backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setBadgeOpen(false)}
                    />
                    <div
                      className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border p-4 flex flex-col gap-3"
                      style={{
                        background: "rgba(10,14,23,0.97)",
                        backdropFilter: "blur(24px)",
                        borderColor: accent?.border ?? "rgba(255,255,255,0.1)",
                        boxShadow: `0 24px 48px -8px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)`,
                      }}
                    >
                      {/* User info */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ background: accent?.bg ?? "rgba(255,255,255,0.06)" }}
                        >
                          {ROLE_ICON[user.role] ?? "👤"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-100 text-sm truncate">{user.username}</div>
                          <div
                            className="text-[10px] font-semibold uppercase tracking-widest"
                            style={{ color: accent?.color }}
                          >
                            {accent?.label ?? user.role}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5" title="Cosmetic ID — not real QDS key material">
                            {fp(user.user_id, user.username)}
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="px-3 py-2 rounded-xl bg-obsidian-900/80 border border-white/[0.06]">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Email</div>
                        <div className="text-xs text-slate-300 font-mono truncate">{user.email}</div>
                      </div>

                      {/* Role badge */}
                      <div
                        className="px-3 py-2 rounded-xl border"
                        style={{ background: accent?.bg, borderColor: accent?.border }}
                      >
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Access Level</div>
                        <div className="text-xs font-bold" style={{ color: accent?.color }}>
                          {accent?.label} — {
                            user.role === "signer"    ? "Document Signing" :
                            user.role === "verifier"  ? "Signature Verification" :
                            user.role === "admin"     ? "Threat Analytics & Admin" :
                            "Attack Lab & Adversarial Testing"
                          }
                        </div>
                      </div>

                      {/* Sign out */}
                      <button
                        onClick={() => { setBadgeOpen(false); logout(); }}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quick Demo — only show when no user logged in, or on large screens */}
            {!user && (
              <button
                onClick={onQuickRun}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-quantum-glow transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Quick Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile nav row ───────────────────────────────────── */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-1.5 border-t border-white/[0.06] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "text-white border"
                    : "text-slate-400 hover:bg-white/[0.04] border border-transparent"
                }`}
                style={isActive && accent ? {
                  background: accent.bg,
                  borderColor: accent.border,
                  color: accent.color,
                } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
