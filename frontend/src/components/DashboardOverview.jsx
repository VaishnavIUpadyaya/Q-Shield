"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Cpu, Activity, Zap, CheckCircle2, Lock, ArrowRight, FileKey, Radio, Database, Sparkles, Scale, RefreshCw } from "lucide-react";

export default function DashboardOverview({ metrics, onNavigateToSim, onRunPreset }) {
  const kpiCards = [
    {
      title: "Attack Detection Rate",
      value: `${((metrics?.detection_rate ?? 1.0) * 100).toFixed(1)}%`,
      subtitle: "Empirical rate of quantum threats flagged",
      icon: ShieldCheck,
      color: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      border: "border-emerald-500/30",
      glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
      text: "text-emerald-400",
      badge: "Target: 100%",
    },
    {
      title: "False Acceptance Rate (FAR)",
      value: `${((metrics?.false_acceptance_rate ?? 0.0) * 100).toFixed(2)}%`,
      subtitle: "Malicious signatures falsely accepted",
      icon: ShieldAlert,
      color: "from-cyan-500/10 via-cyan-500/5 to-transparent",
      border: "border-cyan-500/30",
      glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
      text: "text-cyan-400",
      badge: "Zero Tolerance",
    },
    {
      title: "False Rejection Rate (FRR)",
      value: `${((metrics?.false_rejection_rate ?? 0.0) * 100).toFixed(2)}%`,
      subtitle: "Legitimate signatures falsely rejected",
      icon: Scale,
      color: "from-purple-500/10 via-purple-500/5 to-transparent",
      border: "border-purple-500/30",
      glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
      text: "text-purple-400",
      badge: "Optimal Alpha",
    },
    {
      title: "Verification Accuracy",
      value: `${((metrics?.accuracy ?? 1.0) * 100).toFixed(1)}%`,
      subtitle: "Correct classification across all states",
      icon: Activity,
      color: "from-blue-500/10 via-blue-500/5 to-transparent",
      border: "border-blue-500/30",
      glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
      text: "text-blue-400",
      badge: "Empirical Bound",
    },
  ];

  const attackVectors = [
    {
      id: "forgery",
      name: "Signature Forgery",
      category: "Cryptographic Tampering",
      desc: "An adversary attempts to forge or alter the teleported quantum state, inducing measurable deviations from private-key projection correlations.",
      method: "Total Variation Distance & Wilson 95% CI",
      icon: FileKey,
      fraction: 0.4,
      presetMessage: "00",
    },
    {
      id: "channel_manipulation",
      name: "Quantum Channel Manipulation",
      category: "Physical Layer Attack",
      desc: "Adversary introduces bit-flip (X), phase-flip (Z), or depolarizing noise onto the quantum channel connecting Alice and Bob.",
      method: "Binomial Proportion Hypothesis Testing",
      icon: Radio,
      fraction: 0.35,
      presetMessage: "01",
    },
    {
      id: "replay",
      name: "Replay Attack",
      category: "Session Freshness Violation",
      desc: "Capturing a valid quantum signature from a previous session and attempting to replay it in a new, unauthenticated transaction context.",
      method: "Temporal Nonce & Measurement Vector Invalidation",
      icon: RefreshCw,
      fraction: 0.5,
      presetMessage: "10",
    },
    {
      id: "impersonation",
      name: "Signer Impersonation",
      category: "Identity & Key Spoofing",
      desc: "An unauthorized entity claims to be Alice without access to her entangled Bell pair or Table 1 private key indices.",
      method: "GHZ Correlation Discrepancy Analysis",
      icon: ShieldAlert,
      fraction: 0.45,
      presetMessage: "11",
    },
    {
      id: "unauthorized_verification",
      name: "Unauthorized Verification",
      category: "Access Control Breach",
      desc: "An unauthenticated third party attempts to intercept verification parameters or force measurement collapses without credentials.",
      method: "Access Key & Bell Verification Integrity Check",
      icon: Lock,
      fraction: 0.3,
      presetMessage: "00",
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Spacious Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-white/[0.1] bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-br from-quantum-cyan/15 to-quantum-purple/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-quantum-cyan text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>SIH26141 Quantum Cybersecurity Framework</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
            Quantum Threat Detection for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-quantum-cyan via-quantum-blue to-quantum-purple">
              Digital Signature Security
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
            Simulates teleportation-based Quantum Digital Signature (QDS) protocols on Qiskit Aer, subjecting quantum states to 5 cyber-threat vectors and verifying integrity using <span className="text-white font-semibold underline decoration-cyan-400 decoration-2 underline-offset-4">pure statistical mathematics (Zero AI/ML)</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onNavigateToSim}
              className="inline-flex items-center space-x-3 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-bold text-base shadow-quantum-glow transition-all transform active:scale-95"
            >
              <Cpu className="w-5 h-5 text-black" />
              <span>Launch Simulation Studio</span>
              <ArrowRight className="w-5 h-5 text-black" />
            </button>

            <button
              onClick={() => onRunPreset("forgery", "00", 0.4)}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/[0.08] text-slate-200 hover:text-white font-semibold text-base border border-white/[0.12] transition-all"
            >
              <Zap className="w-4 h-4 text-quantum-cyan" />
              <span>Test Forgery Scenario</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid with Spacious Layout and Large Typography */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center space-x-3">
              <Activity className="w-7 h-7 text-quantum-cyan" />
              <span>Core Security Benchmarks</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Real-time statistical validation derived from quantum measurements
            </p>
          </div>
          <span className="text-xs sm:text-sm font-mono px-3.5 py-1.5 rounded-xl bg-obsidian-900 text-slate-300 border border-white/[0.08] self-start sm:self-auto">
            {metrics?.total_experiments ?? 0} Recorded Experiments
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-7 bg-gradient-to-b ${card.color} glass-panel border ${card.border} ${card.glow} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-obsidian-950/80 text-slate-300 border border-white/[0.06]">
                    {card.badge}
                  </span>
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <span className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight ${card.text}`}>{card.value}</span>
                  <div className={`p-3 rounded-xl bg-obsidian-950/60 ${card.text}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300 font-medium leading-normal">{card.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 Attack Threat Vectors */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center space-x-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            <span>Supported Quantum Threat Vectors</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate and detect realistic physical-layer and cryptographic attack scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attackVectors.map((att) => {
            const Icon = att.icon;
            return (
              <div
                key={att.id}
                className="rounded-2xl glass-panel p-7 border border-white/[0.08] hover:border-quantum-cyan/40 hover:bg-obsidian-850/80 transition-all duration-300 flex flex-col justify-between hover:shadow-quantum-glow"
              >
                <div>
                  <div className="flex items-center space-x-3.5 mb-4">
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white">{att.name}</h3>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{att.category}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-5">{att.desc}</p>

                  <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/[0.06] text-xs font-mono text-cyan-300 mb-6">
                    <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Detection Model:</span>
                    {att.method}
                  </div>
                </div>

                <button
                  onClick={() => onRunPreset(att.id, att.presetMessage, att.fraction)}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-quantum-cyan text-sm font-bold border border-cyan-500/30 transition-all active:scale-[0.98]"
                >
                  <span>Simulate {att.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Legitimate Reference Card */}
          <div className="rounded-2xl glass-panel p-7 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-transparent flex flex-col justify-between hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all">
            <div>
              <div className="flex items-center space-x-3.5 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-emerald-300">Legitimate QDS Baseline</h3>
                  <span className="text-xs text-emerald-400/80 uppercase tracking-wider font-medium">Authentic Execution</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                Authentic sender Alice signs message with private key. Bob verifies via Bell measurement and Pauli corrections with 100% expected correlation.
              </p>

              <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/[0.06] text-xs font-mono text-emerald-300 mb-6">
                <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Expected Outcome:</span>
                Acceptance (Deviation = 0.00, p-val = 1.0)
              </div>
            </div>

            <button
              onClick={() => onRunPreset("none", "00", 0.0)}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-sm font-bold border border-emerald-500/30 transition-all active:scale-[0.98]"
            >
              <span>Verify Legitimate Signature</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
