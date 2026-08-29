"use client";

import React, { useState } from "react";
import { Play, RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Layers, BarChart2, Activity, HelpCircle, FileKey, Radio, RefreshCw, Lock, Sparkles, Sliders, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from "recharts";

export default function SimulationStudio({
  simConfig,
  setSimConfig,
  onRunSimulation,
  loading,
  lastResult,
}) {
  const [activePipelineStep, setActivePipelineStep] = useState(null);

  const attackOptions = [
    { id: "none", name: "None (Legitimate)", desc: "Authentic signature without attack", icon: CheckCircle2, color: "text-emerald-400" },
    { id: "forgery", name: "Signature Forgery", desc: "Forged quantum signature state", icon: FileKey, color: "text-rose-400" },
    { id: "channel_manipulation", name: "Channel Manipulation", desc: "Noise & qubit flipping in transit", icon: Radio, color: "text-amber-400" },
    { id: "replay", name: "Replay Attack", desc: "Reuse of previously valid signature", icon: RefreshCw, color: "text-orange-400" },
    { id: "impersonation", name: "Signer Impersonation", desc: "Unregistered sender impersonating Alice", icon: ShieldAlert, color: "text-red-400" },
    { id: "unauthorized_verification", name: "Unauthorized Verification", desc: "Unauthorized entity attempting verification", icon: Lock, color: "text-purple-400" },
  ];

  const presets = [
    { label: "Legitimate Baseline", attack: "none", msg: "00", fraction: 0.0, shots: 1000 },
    { label: "Signature Forgery (40%)", attack: "forgery", msg: "00", fraction: 0.4, shots: 1000 },
    { label: "Channel Noise (30%)", attack: "channel_manipulation", msg: "01", fraction: 0.3, shots: 1000 },
    { label: "Replay Attempt", attack: "replay", msg: "10", fraction: 0.0, shots: 1000 },
  ];

  const applyPreset = (preset) => {
    setSimConfig((prev) => ({
      ...prev,
      attack_type: preset.attack,
      message: preset.msg,
      attack_fraction: preset.fraction,
      shots: preset.shots,
    }));
  };

  // Format data for Expected vs Observed Bar Chart
  const chartData = [
    {
      state: "|00⟩",
      Expected: Number(((lastResult?.measurements?.expected_distribution?.["00"] ?? (simConfig.message === "00" ? 1.0 : 0.0)) * 100).toFixed(1)),
      Observed: Number(((lastResult?.measurements?.probabilities?.["00"] ?? (simConfig.message === "00" ? 1.0 : 0.0)) * 100).toFixed(1)),
      count: lastResult?.measurements?.counts?.["00"] ?? (simConfig.message === "00" ? simConfig.shots : 0),
    },
    {
      state: "|01⟩",
      Expected: Number(((lastResult?.measurements?.expected_distribution?.["01"] ?? (simConfig.message === "01" ? 1.0 : 0.0)) * 100).toFixed(1)),
      Observed: Number(((lastResult?.measurements?.probabilities?.["01"] ?? (simConfig.message === "01" ? 1.0 : 0.0)) * 100).toFixed(1)),
      count: lastResult?.measurements?.counts?.["01"] ?? (simConfig.message === "01" ? simConfig.shots : 0),
    },
    {
      state: "|10⟩",
      Expected: Number(((lastResult?.measurements?.expected_distribution?.["10"] ?? (simConfig.message === "10" ? 1.0 : 0.0)) * 100).toFixed(1)),
      Observed: Number(((lastResult?.measurements?.probabilities?.["10"] ?? (simConfig.message === "10" ? 1.0 : 0.0)) * 100).toFixed(1)),
      count: lastResult?.measurements?.counts?.["10"] ?? (simConfig.message === "10" ? simConfig.shots : 0),
    },
    {
      state: "|11⟩",
      Expected: Number(((lastResult?.measurements?.expected_distribution?.["11"] ?? (simConfig.message === "11" ? 1.0 : 0.0)) * 100).toFixed(1)),
      Observed: Number(((lastResult?.measurements?.probabilities?.["11"] ?? (simConfig.message === "11" ? 1.0 : 0.0)) * 100).toFixed(1)),
      count: lastResult?.measurements?.counts?.["11"] ?? (simConfig.message === "11" ? simConfig.shots : 0),
    },
  ];

  const detection = lastResult?.detection_result;
  const isThreat = detection?.attack_detected ?? (simConfig.attack_type !== "none");
  const isLegitimate = lastResult?.attack_type === "none" || (!isThreat && lastResult?.verification_result === "VALID");

  const pipelineStages = [
    {
      id: "state_prep",
      title: "1. State Preparation",
      math: "|ψ⟩_Alice",
      desc: `Alice encodes message '${simConfig.message}' into private Pauli eigenstate.`,
    },
    {
      id: "bell_entangle",
      title: "2. Bell Entanglement",
      math: "(|00⟩+|11⟩)/√2",
      desc: "Entangled GHZ/Bell channel established between Signer & Verifiers.",
    },
    {
      id: "teleportation",
      title: "3. Quantum Teleportation",
      math: "Bell Measurement",
      desc: "Alice performs joint Bell measurement, collapsing qubits to 2 classical bits.",
    },
    {
      id: "pauli_correction",
      title: "4. Pauli Corrections",
      math: "X^(c1) · Z^(c0)",
      desc: "Conditional Pauli X/Z gates applied based on Alice's classical measurement bits.",
    },
    {
      id: "measurement",
      title: "5. Bob Measurement",
      math: `${simConfig.measurement_basis} Basis`,
      desc: `Bob measures signature state in ${simConfig.measurement_basis}-basis to verify authenticity.`,
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white flex items-center space-x-3">
            <Cpu className="w-8 h-8 text-quantum-cyan" />
            <span>Quantum Simulation Studio</span>
          </h1>
          <p className="text-base text-slate-300 mt-2 font-normal">
            Configure quantum circuits, inject adversarial noise, and observe live projective measurement statistics.
          </p>
        </div>

        {/* Quick Presets with larger buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-obsidian-900 hover:bg-obsidian-850 text-slate-300 hover:text-white border border-white/[0.1] hover:border-quantum-cyan/40 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Controls (1/3) & Right Visualization (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Parameter Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl glass-panel p-7 border border-white/[0.1] shadow-glass-card space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.06]">
              <Sliders className="w-5 h-5 text-quantum-cyan" />
              <h2 className="text-lg font-bold text-white">Quantum Parameters</h2>
            </div>

            {/* Message Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                QDS Message to Sign:
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {["00", "01", "10", "11"].map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => setSimConfig((prev) => ({ ...prev, message: msg }))}
                    className={`py-3 rounded-xl font-mono text-sm font-bold transition-all ${
                      simConfig.message === msg
                        ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-400 shadow-quantum-glow"
                        : "bg-obsidian-950/80 text-slate-400 hover:text-slate-200 border border-white/[0.08]"
                    }`}
                  >
                    |{msg}⟩
                  </button>
                ))}
              </div>
            </div>

            {/* Measurement Basis */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Bob's Measurement Basis:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "Z", label: "Z (Computational)" },
                  { id: "X", label: "X (Hadamard)" },
                  { id: "Y", label: "Y (Circular)" },
                ].map((basis) => (
                  <button
                    key={basis.id}
                    type="button"
                    onClick={() => setSimConfig((prev) => ({ ...prev, measurement_basis: basis.id }))}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      simConfig.measurement_basis === basis.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-obsidian-950/80 text-slate-400 border border-white/[0.08] hover:bg-white/[0.04]"
                    }`}
                  >
                    {basis.id} Basis
                  </button>
                ))}
              </div>
            </div>

            {/* Shots Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">
                  Quantum Shots (Aer):
                </label>
                <span className="text-sm font-mono font-bold text-quantum-cyan px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  {simConfig.shots.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={simConfig.shots}
                onChange={(e) => setSimConfig((prev) => ({ ...prev, shots: Number(e.target.value) }))}
                className="w-full h-2 bg-obsidian-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                <span>100</span>
                <span>2,500</span>
                <span>5,000</span>
              </div>
            </div>

            {/* Attack Scenario Selector */}
            <div className="pt-2 border-t border-white/[0.06]">
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Adversary Threat Vector:
              </label>
              <select
                value={simConfig.attack_type}
                onChange={(e) => setSimConfig((prev) => ({ ...prev, attack_type: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-white/[0.12] text-sm text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
              >
                {attackOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-obsidian-900 py-2">
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Attack Strength Slider (When Attack Selected) */}
            {simConfig.attack_type !== "none" && (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    Attack Strength / Noise:
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/20">
                    {(simConfig.attack_fraction * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={simConfig.attack_fraction}
                  onChange={(e) => setSimConfig((prev) => ({ ...prev, attack_fraction: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-obsidian-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            )}

            {/* Big Action Button */}
            <button
              onClick={onRunSimulation}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-display font-bold text-base text-black flex items-center justify-center space-x-3 shadow-quantum-glow transition-all transform active:scale-98 ${
                loading
                  ? "bg-cyan-600/50 cursor-not-allowed opacity-80"
                  : "bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Executing Qiskit Aer...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-black" />
                  <span>Run Quantum Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Visualizer, Detection Banner, Measurement Chart */}
        <div className="lg:col-span-8 space-y-8">

          {/* 5-Stage Protocol Pipeline Visualizer */}
          <div className="rounded-3xl glass-panel p-7 border border-white/[0.1]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2.5">
                <Layers className="w-5 h-5 text-quantum-cyan" />
                <span>Xu-Wang QDS Protocol Execution Flow</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">5-Stage Teleportation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {pipelineStages.map((stage, idx) => (
                <div
                  key={stage.id}
                  onClick={() => setActivePipelineStep(activePipelineStep === stage.id ? null : stage.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border text-center ${
                    activePipelineStep === stage.id
                      ? "bg-cyan-500/20 border-cyan-400 shadow-quantum-glow"
                      : "bg-obsidian-950/80 border-white/[0.06] hover:border-white/[0.2] hover:bg-obsidian-900"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-200 block mb-1">{stage.title}</span>
                  <span className="text-xs font-mono font-bold text-quantum-cyan block bg-obsidian-900/90 py-1 rounded-lg border border-white/[0.04]">
                    {stage.math}
                  </span>
                </div>
              ))}
            </div>

            {activePipelineStep && (
              <div className="mt-4 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-sm text-cyan-200">
                {pipelineStages.find((s) => s.id === activePipelineStep)?.desc}
              </div>
            )}
          </div>

          {/* Prominent Threat Detection Result Banner */}
          {lastResult && (
            <div
              className={`rounded-3xl p-7 border transition-all ${
                isThreat
                  ? "bg-gradient-to-r from-rose-950/40 via-obsidian-900 to-rose-950/40 border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.2)]"
                  : "bg-gradient-to-r from-emerald-950/40 via-obsidian-900 to-emerald-950/40 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.2)]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`p-3 rounded-2xl ${
                      isThreat ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {isThreat ? <ShieldAlert className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Statistical Detection Verdict
                    </span>
                    <h3
                      className={`text-2xl sm:text-3xl font-display font-extrabold tracking-tight ${
                        isThreat ? "text-rose-400" : "text-emerald-300"
                      }`}
                    >
                      {isThreat ? "THREAT DETECTED · SIGNATURE REJECTED" : "SIGNATURE VERIFIED · AUTHENTIC"}
                    </h3>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-slate-400 block font-mono">Verification Mode</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {lastResult.attack_type === "none" ? "Legitimate Baseline" : lastResult.attack_type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Mathematical Diagnostics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-white/[0.06]">
                  <span className="text-xs text-slate-400 block font-medium">Total Variation (TVD)</span>
                  <span className="text-2xl font-extrabold font-mono text-white mt-1 block">
                   {(detection?.statistic ?? detection?.deviation ?? 0.0).toFixed(4)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-white/[0.06]">
                  <span className="text-xs text-slate-400 block font-medium">Hypothesis p-value</span>
                 <span className="text-2xl font-extrabold font-mono text-white mt-1 block">
                  {(detection?.p_value ?? 1.0).toFixed(4)}
                 </span>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-white/[0.06]">
                  <span className="text-xs text-slate-400 block font-medium">Wilson 95% Bound</span>
                  <span className="text-sm font-extrabold font-mono text-cyan-300 mt-2 block">
                    {detection?.confidence_interval
                      ? `[${detection.confidence_interval[0].toFixed(2)}, ${detection.confidence_interval[1].toFixed(2)}]`
                      : "[0.00, 0.05]"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-white/[0.06]">
                  <span className="text-xs text-slate-400 block font-medium">Detector Decision</span>
                  <span
                    className={`text-base font-extrabold font-mono mt-2 block ${
                      isThreat ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {isThreat ? "ATTACK_FLAGGED" : "SIGNATURE_VALID"}
                  </span>
                </div>
              </div>

              {/* Explainability Explanation */}
              {detection?.reason && (
                <div className="mt-5 p-4 rounded-2xl bg-obsidian-950/90 border border-white/[0.08] text-sm text-slate-300 leading-relaxed">
                  <span className="font-bold text-white mr-2">Mathematical Rationale:</span>
                  {detection.reason}
                </div>
              )}
            </div>
          )}

          {/* Expected vs. Observed Measurement Chart */}
          <div className="rounded-3xl glass-panel p-7 border border-white/[0.1]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2.5">
                  <BarChart2 className="w-6 h-6 text-quantum-cyan" />
                  <span>Projective Measurement Probabilities</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Comparison between Expected QDS state projection vs Observed Qiskit Aer distribution
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-obsidian-950 text-slate-300 border border-white/[0.08] self-start sm:self-auto">
                Basis: {simConfig.measurement_basis} | Shots: {simConfig.shots.toLocaleString()}
              </span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="state" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 14, fontWeight: "bold" }} />
                  <YAxis unit="%" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0E17",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "16px",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.8)",
                      color: "#F8FAFC",
                      fontSize: "13px",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "14px", fontSize: "13px", fontWeight: "600" }} />
                  <Bar dataKey="Expected" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={32} />
                  <Bar dataKey="Observed" fill={isThreat ? "#F43F5E" : "#00F2FE"} radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed 2-Qubit State Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-xs font-bold uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 px-3">Quantum State</th>
                    <th className="pb-3 px-3">Expected %</th>
                    <th className="pb-3 px-3">Observed %</th>
                    <th className="pb-3 px-3">Raw Shot Count</th>
                    <th className="pb-3 px-3 text-right">Deviation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono text-sm">
                  {chartData.map((row) => {
                    const diff = (row.Observed - row.Expected).toFixed(1);
                    return (
                      <tr key={row.state} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{row.state}</td>
                        <td className="py-3 px-3 text-indigo-300 font-semibold">{row.Expected}%</td>
                        <td className="py-3 px-3 font-bold text-quantum-cyan">{row.Observed}%</td>
                        <td className="py-3 px-3 text-slate-300">{row.count.toLocaleString()} shots</td>
                        <td
                          className={`py-3 px-3 text-right font-bold ${
                            Math.abs(diff) > 5 ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {diff > 0 ? `+${diff}%` : `${diff}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
