"use client";

import React from "react";
import { Shield, ShieldAlert, Cpu, Activity, Database, FlaskConical, BarChart3, History, Sparkles } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, backendStatus, onQuickRun }) {
  const navItems = [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "simulation", label: "Simulation Studio", icon: Cpu },
    { id: "batch", label: "Batch Benchmarks", icon: FlaskConical },
    { id: "threats", label: "Threat Analytics", icon: ShieldAlert },
    { id: "history", label: "Experiment Logs", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.08] bg-obsidian-950/80 backdrop-blur-2xl">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-4 cursor-pointer select-none" onClick={() => setActiveTab("overview")}>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-quantum-cyan via-quantum-indigo to-quantum-purple p-[1px] shadow-quantum-glow transition-all hover:scale-105">
                <div className="w-full h-full rounded-[15px] bg-obsidian-900 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-quantum-cyan" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-quantum-cyan rounded-full border-2 border-obsidian-950 animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-display font-extrabold text-2xl tracking-wider text-white">
                  Q-SHIELD
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase bg-cyan-500/10 text-quantum-cyan border border-cyan-500/30">
                  SIH26141
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Quantum Digital Signature Threat Detection Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-2 bg-obsidian-900/90 p-1.5 rounded-2xl border border-white/[0.06]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-quantum-cyan" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backend Status & Fast Action */}
          <div className="flex items-center space-x-4">
            {/* Status indicator */}
            <div className="flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-obsidian-900/90 border border-white/[0.08] text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${backendStatus.online ? "bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-amber-400 animate-pulse"}`}></span>
              <span className="font-mono text-xs font-semibold text-slate-300">
                {backendStatus.online ? "QISKIT AER LIVE" : "OFFLINE ENGINE"}
              </span>
            </div>

            {/* Quick Demo Run */}
            <button
              onClick={onQuickRun}
              className="hidden sm:inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-quantum-glow transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Quick Demo</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-3 space-x-2 border-t border-white/[0.06] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
