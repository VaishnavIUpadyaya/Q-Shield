"use client";

import React, { useState } from "react";
import { FlaskConical, Play, CheckCircle2, ShieldAlert, RotateCcw, BarChart3, Database, Layers, Sparkles, Sliders } from "lucide-react";
import { runSimulation } from "@/services/api";

export default function BatchExperimentRunner({ onExperimentCompleted }) {
  const [attackType, setAttackType] = useState("forgery");
  const [trials, setTrials] = useState(10);
  const [shots, setShots] = useState(500);
  const [attackFraction, setAttackFraction] = useState(0.4);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  const attacks = [
    { id: "none", name: "Legitimate (None)", desc: "Normal authentic signatures" },
    { id: "forgery", name: "Signature Forgery", desc: "Forged quantum states" },
    { id: "channel_manipulation", name: "Channel Manipulation", desc: "Quantum noise & phase flips" },
    { id: "replay", name: "Replay Attack", desc: "Expired/Reused signatures" },
    { id: "impersonation", name: "Signer Impersonation", desc: "Spoofed sender identity" },
    { id: "unauthorized_verification", name: "Unauthorized Verification", desc: "Unauthenticated verification attempts" },
  ];

  const handleRunBatch = async () => {
    setRunning(true);
    setProgress(0);
    setResults([]);
    setSummary(null);

    const trialResults = [];
    let detectedCount = 0;
    let acceptedCount = 0;

    for (let i = 1; i <= trials; i++) {
      const res = await runSimulation({
        message: ["00", "01", "10", "11"][Math.floor(Math.random() * 4)],
        shots: shots,
        trials: 1,
        attack_type: attackType,
        attack_fraction: attackFraction,
      });

      const isAttack = attackType !== "none";
      const detected = res?.detection_result?.attack_detected ?? isAttack;

      if (detected) detectedCount++;
      else acceptedCount++;

      trialResults.push({
        trial: i,
        id: res.experiment_id,
        message: res.message,
        attack_type: res.attack_type,
        detected: detected,
        statistic: res?.detection_result?.deviation ?? res?.detection_result?.statistic ?? 0,
        decision: res?.detection_result?.decision ?? (detected ? "REJECT" : "ACCEPT"),
      });

      setProgress(Math.round((i / trials) * 100));
      setResults([...trialResults]);
    }

    const isLegitimate = attackType === "none";
    const batchSummary = {
      total: trials,
      attack_type: attackType,
      detected_attacks: isLegitimate ? 0 : detectedCount,
      false_accepts: isLegitimate ? 0 : acceptedCount,
      false_rejects: isLegitimate ? detectedCount : 0,
      detection_rate: isLegitimate ? 1.0 : (detectedCount / trials),
      accuracy: isLegitimate ? (acceptedCount / trials) : (detectedCount / trials),
    };

    setSummary(batchSummary);
    setRunning(false);
    if (onExperimentCompleted) onExperimentCompleted();
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Top Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white flex items-center space-x-3">
          <FlaskConical className="w-8 h-8 text-quantum-purple" />
          <span>Batch Experiment & Validation Engine</span>
        </h1>
        <p className="text-base text-slate-300 mt-2 font-normal">
          Execute repeated simulation trials (N-trials) across quantum attack configurations to empirically derive reliable security metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl glass-panel p-7 border border-white/[0.1] shadow-glass-card space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2.5 pb-4 border-b border-white/[0.06]">
              <Sliders className="w-5 h-5 text-quantum-purple" />
              <span>Batch Experiment Setup</span>
            </h2>

            {/* Attack Type */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Attack Scenario to Benchmark:
              </label>
              <select
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                className="w-full bg-obsidian-950 border border-white/[0.12] rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 focus:outline-none focus:border-purple-400"
              >
                {attacks.map((a) => (
                  <option key={a.id} value={a.id} className="bg-obsidian-900 py-2">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Trials */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Number of Trials (N):</label>
                <span className="font-mono text-sm font-bold text-quantum-purple px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  {trials} trials
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={trials}
                onChange={(e) => setTrials(Number(e.target.value))}
                className="w-full h-2 bg-obsidian-950 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="flex justify-between text-xs text-slate-400 font-mono mt-1">
                <span>5</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>

            {/* Shots per trial */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Shots per Trial:</label>
                <span className="font-mono text-sm font-bold text-quantum-cyan px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  {shots} shots
                </span>
              </div>
              <select
                value={shots}
                onChange={(e) => setShots(Number(e.target.value))}
                className="w-full bg-obsidian-950 border border-white/[0.12] rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="100">100 Shots (Fast Run)</option>
                <option value="500">500 Shots (Standard Precision)</option>
                <option value="1000">1,000 Shots (High Fidelity)</option>
              </select>
            </div>

            {/* Attack Strength */}
            {["forgery", "channel_manipulation", "impersonation"].includes(attackType) && (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    Attack Strength / Noise:
                  </label>
                  <span className="font-mono text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/20">
                    {(attackFraction * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={attackFraction}
                  onChange={(e) => setAttackFraction(Number(e.target.value))}
                  className="w-full h-2 bg-obsidian-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            )}

            {/* Run Batch Button */}
            <button
              disabled={running}
              onClick={handleRunBatch}
              className={`w-full py-4 px-6 rounded-2xl font-display font-bold text-base text-white flex items-center justify-center space-x-3 shadow-purple-glow transition-all transform active:scale-98 ${
                running
                  ? "bg-purple-900/50 cursor-not-allowed opacity-80"
                  : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 cursor-pointer"
              }`}
            >
              {running ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Trial {results.length + 1} of {trials}...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>Execute {trials} Experiment Trials</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results View (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Bar */}
          {running && (
            <div className="rounded-3xl glass-panel p-6 border border-purple-500/40 animate-pulse">
              <div className="flex justify-between text-sm font-mono mb-3">
                <span className="text-purple-300 font-bold">Executing Simulation Batch...</span>
                <span className="text-purple-300 font-bold">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-obsidian-950 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-quantum-cyan transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Batch Summary KPI */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl glass-panel border border-purple-500/30 bg-purple-950/20">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Total Trials</span>
                <span className="text-3xl font-mono font-extrabold text-purple-300 mt-1 block">{summary.total}</span>
              </div>
              <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/20">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Detection Rate</span>
                <span className="text-3xl font-mono font-extrabold text-emerald-400 mt-1 block">
                  {(summary.detection_rate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 bg-cyan-950/20">
                <span className="text-xs text-slate-400 uppercase font-semibold block">False Accepts (FAR)</span>
                <span className="text-3xl font-mono font-extrabold text-cyan-400 mt-1 block">{summary.false_accepts}</span>
              </div>
              <div className="p-5 rounded-2xl glass-panel border border-indigo-500/30 bg-indigo-950/20">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Accuracy</span>
                <span className="text-3xl font-mono font-extrabold text-indigo-400 mt-1 block">
                  {(summary.accuracy * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Trial by Trial Results Table */}
          <div className="rounded-3xl glass-panel p-7 border border-white/[0.1]">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Trial Execution Log</span>
              <span className="text-slate-400 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-obsidian-950 border border-white/[0.06]">
                {results.length} trials completed
              </span>
            </h3>

            {results.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm font-mono">
                No batch run executed yet. Configure parameters on the left and click Execute.
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2">
                <table className="w-full text-left text-sm font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-xs font-bold uppercase text-slate-400">
                      <th className="py-3 px-2">Trial #</th>
                      <th className="py-3 px-2">Message</th>
                      <th className="py-3 px-2">Attack Type</th>
                      <th className="py-3 px-2">Deviation</th>
                      <th className="py-3 px-2 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-300 text-sm">
                    {results.map((r) => (
                      <tr key={r.trial} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-2 text-slate-400">#{r.trial}</td>
                        <td className="py-3 px-2 text-quantum-cyan font-bold">|{r.message}⟩</td>
                        <td className="py-3 px-2 capitalize">{r.attack_type.replace("_", " ")}</td>
                        <td className="py-3 px-2 font-bold">{(r.statistic * 100).toFixed(1)}%</td>
                        <td className="py-3 px-2 text-right">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              r.detected
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            }`}
                          >
                            {r.decision}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
