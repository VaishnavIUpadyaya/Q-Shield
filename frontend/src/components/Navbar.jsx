"use client";

import React from "react";
import { Shield, ShieldAlert, Cpu, Activity, Database, FlaskConical, BarChart3, History, CheckCircle2, AlertTriangle } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, backendStatus, onQuickRun }) {
  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: BarChart3 },
    { id: "simulation", label: "Quantum Simulation Studio", icon: Cpu },
    { id: "batch", label: "Batch Experiments", icon: FlaskConical },
    { id: "threats", label: "Threat Analytics", icon: ShieldAlert },
    { id: "history", label: "Experiment History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#05070f]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-[#05070f] animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                  Q-SHIELD
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  QDS-v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Quantum Cyber Threat Detection · SIH26141
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backend Status & Fast Action */}
          <div className="flex items-center space-x-3">
            {/* Status indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${backendStatus.online ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" : "bg-amber-400 animate-pulse"}`}></span>
              <span className="font-mono text-[11px] text-slate-300">
                {backendStatus.online ? "QISKIT BACKEND LIVE" : "LOCAL SIMULATOR"}
              </span>
            </div>

            {/* Quick Demo Run */}
            <button
              onClick={onQuickRun}
              className="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-cyan-600/25 transition-all transform active:scale-95 border border-cyan-400/30"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Launch Demo</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 space-x-2 border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
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
