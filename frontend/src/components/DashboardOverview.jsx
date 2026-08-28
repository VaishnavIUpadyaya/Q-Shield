"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Cpu, Activity, Zap, CheckCircle2, Lock, ArrowRight, Layers, FileKey, Radio, Database, Sparkles, Scale, RefreshCw } from "lucide-react";

export default function DashboardOverview({ metrics, onNavigateToSim, onRunPreset }) {
  const kpiCards = [
    {
      title: "Attack Detection Rate",
      value: `${((metrics?.detection_rate ?? 1.0) * 100).toFixed(1)}%`,
      subtitle: "Fraction of quantum threats detected",
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-emerald-700/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      badge: "Target: 100%",
    },
    {
      title: "False Acceptance Rate (FAR)",
      value: `${((metrics?.false_acceptance_rate ?? 0.0) * 100).toFixed(2)}%`,
      subtitle: "Malicious signatures falsely accepted",
      icon: ShieldAlert,
      color: "from-cyan-500/20 to-blue-700/10",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      badge: "Zero Tolerance",
    },
    {
      title: "False Rejection Rate (FRR)",
      value: `${((metrics?.false_rejection_rate ?? 0.0) * 100).toFixed(2)}%`,
      subtitle: "Legitimate signatures falsely rejected",
      icon: Scale,
      color: "from-indigo-500/20 to-purple-700/10",
      border: "border-indigo-500/30",
      text: "text-indigo-400",
      badge: "Optimal Alpha",
    },
    {
      title: "Verification Accuracy",
      value: `${((metrics?.accuracy ?? 1.0) * 100).toFixed(1)}%`,
      subtitle: "All protocol decisions verified",
      icon: Zap,
      color: "from-purple-500/20 to-pink-700/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
      badge: "Provable Bound",
    },
  ];

  const attackVectors = [
    {
      id: "forgery",
      name: "Signature Forgery",
      category: "Quantum State Modification",
      desc: "Adversary modifies quantum signature states. Detected when projective measurement distributions deviate from legitimate private-key correlation.",
      method: "Total Variation Distance + Wilson Bound",
      icon: FileKey,
      presetMessage: "00",
      fraction: 0.4,
    },
    {
      id: "channel_manipulation",
      name: "Quantum Channel Manipulation",
      category: "Eavesdropping / Noise",
      desc: "Adversary injects bit-flip, phase-flip, or depolarizing noise during quantum transmission. Detected via probability distortion.",
      method: "Hypothesis Proportion Test (p < 0.001)",
      icon: Radio,
      presetMessage: "01",
      fraction: 0.35,
    },
    {
      id: "replay",
      name: "Replay Attack",
      category: "Cryptographic Context",
      desc: "Adversary captures a previously authentic signature and attempts reuse. Detected via session nonce and timestamp freshness.",
      method: "Freshness Verification & Nonce Validation",
      icon: RefreshCw,
      presetMessage: "10",
      fraction: 0.0,
    },
    {
      id: "impersonation",
      name: "Signer Impersonation",
      category: "Identity Violation",
      desc: "Unregistered sender Eve attempts to forge Alice's signature without the entangled GHZ state correlation.",
      method: "Bell State Correlation Discrepancy",
      icon: ShieldAlert,
      presetMessage: "11",
      fraction: 0.5,
    },
    {
      id: "unauthorized_verification",
      name: "Unauthorized Verification",
      category: "Access Violation",
      desc: "Unauthorized node attempts to verify confidential quantum signatures without public verification keys.",
      method: "Access Policy & Key Authorization",
      icon: Lock,
      presetMessage: "00",
      fraction: 0.0,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-panel-glow p-6 sm:p-8 quantum-grid-bg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Problem Statement SIH26141 · No AI / ML Detection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Quantum-Inspired Threat Detection for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
              Digital Signature Security
            </span>
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Q-SHIELD simulates teleportation-based Quantum Digital Signatures (QDS) with Bell-state entanglement, Pauli corrections, and projective measurements. It statistically detects malicious attacks with <strong>zero AI/ML</strong>, using protocol-derived mathematical thresholds.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToSim}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Simulation Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onRunPreset("none", "00", 0.0)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Run Legitimate Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Core Security Metrics</span>
          </h2>
          <span className="text-xs text-slate-400">
            Calculated across {metrics?.total_experiments ?? 0} simulation runs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-xl p-5 bg-gradient-to-br ${card.color} glass-panel border ${card.border} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/60 text-slate-300 border border-slate-800">
                    {card.badge}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className={`text-3xl font-extrabold font-mono ${card.text}`}>{card.value}</span>
                  <div className={`p-2 rounded-lg bg-slate-950/40 ${card.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">{card.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 Attack Threat Vectors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Supported Quantum Threat Vectors</span>
            </h2>
            <p className="text-xs text-slate-400">
              Each scenario interacts directly with the quantum state or security context
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attackVectors.map((att) => {
            const Icon = att.icon;
            return (
              <div
                key={att.id}
                className="rounded-xl glass-panel p-5 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100">{att.name}</h3>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{att.category}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{att.desc}</p>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-cyan-300/90 mb-4">
                    <span className="text-slate-500 block text-[10px] uppercase">Detection Method:</span>
                    {att.method}
                  </div>
                </div>

                <button
                  onClick={() => onRunPreset(att.id, att.presetMessage, att.fraction)}
                  className="w-full inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 text-xs font-semibold border border-cyan-800/50 transition-all"
                >
                  <span>Simulate {att.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Legitimate Reference Card */}
          <div className="rounded-xl glass-panel p-5 border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2.5 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-300">Legitimate QDS Baseline</h3>
                  <span className="text-[10px] text-emerald-500/80 uppercase tracking-wider">Normal Operation</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Authentic sender Alice signs message with private key. Bob verifies via Bell measurement and Pauli corrections with 100% expected correlation.
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-emerald-300/90 mb-4">
                <span className="text-slate-500 block text-[10px] uppercase">Expected Outcome:</span>
                Acceptance (Deviation = 0.00, p-val = 1.0)
              </div>
            </div>

            <button
              onClick={() => onRunPreset("none", "00", 0.0)}
              className="w-full inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-700/50 transition-all"
            >
              <span>Verify Legitimate Signature</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6-Engineer Architecture Breakdown */}
      <div className="rounded-xl glass-panel p-6 border border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>System Architecture & Role Pipeline (P1 — P6)</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          End-to-end execution flow connecting Qiskit quantum simulations, statistical verification, and API visualization.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-cyan-800/40">
            <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1">P1</span>
            <span className="text-xs font-bold text-white block">Quantum Protocol</span>
            <span className="text-[10px] text-slate-400 block mt-1">Qiskit Aer, Bell Pairs, Teleportation</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-emerald-800/40">
            <span className="text-[10px] font-mono font-bold text-emerald-400 block mb-1">P2</span>
            <span className="text-xs font-bold text-white block">Statistical Detector</span>
            <span className="text-[10px] text-slate-400 block mt-1">Total Variation & Wilson Bounds</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-rose-800/40">
            <span className="text-[10px] font-mono font-bold text-rose-400 block mb-1">P3</span>
            <span className="text-xs font-bold text-white block">Attack Engine</span>
            <span className="text-[10px] text-slate-400 block mt-1">Forgery, Replay, Channel Noise</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-purple-800/40">
            <span className="text-[10px] font-mono font-bold text-purple-400 block mb-1">P4</span>
            <span className="text-xs font-bold text-white block">Experiment Runner</span>
            <span className="text-[10px] text-slate-400 block mt-1">N-Trials, Security Metrics, Datasets</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-amber-800/40">
            <span className="text-[10px] font-mono font-bold text-amber-400 block mb-1">P5</span>
            <span className="text-xs font-bold text-white block">FastAPI Backend</span>
            <span className="text-[10px] text-slate-400 block mt-1">REST API, Firestore Storage</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-pink-800/40">
            <span className="text-[10px] font-mono font-bold text-pink-400 block mb-1">P6</span>
            <span className="text-xs font-bold text-white block">React Dashboard</span>
            <span className="text-[10px] text-slate-400 block mt-1">Interactive UI, Charts, Real-time Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
