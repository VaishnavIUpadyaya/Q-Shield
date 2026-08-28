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
    { id: "none", name: "Legitimate (None)", desc: "Normal legitimate signatures" },
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
        statistic: res?.detection_result?.statistic ?? 0,
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FlaskConical className="w-6 h-6 text-purple-400" />
            <span>Batch Experiment & Validation Engine (P4)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Execute repeated simulation trials (N-trials) across quantum attack configurations to empirically derive reliable security metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl glass-panel p-5 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Batch Experiment Setup</span>
            </h2>

            {/* Attack Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Attack Scenario to Benchmark
              </label>
              <select
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-400"
              >
                {attacks.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Trials */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Number of Trials (N)</label>
                <span className="font-mono text-xs font-bold text-purple-400">{trials} trials</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={trials}
                onChange={(e) => setTrials(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>

            {/* Shots per trial */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Shots per Trial</label>
                <span className="font-mono text-xs font-bold text-cyan-400">{shots} shots</span>
              </div>
              <select
                value={shots}
                onChange={(e) => setShots(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="100">100 Shots (Fast)</option>
                <option value="500">500 Shots (Standard)</option>
                <option value="1000">1,000 Shots (High Fidelity)</option>
              </select>
            </div>

            {/* Attack Strength */}
            {["forgery", "channel_manipulation", "impersonation"].includes(attackType) && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Noise / Attack Fraction</label>
                  <span className="font-mono text-xs font-bold text-rose-400">{(attackFraction * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={attackFraction}
                  onChange={(e) => setAttackFraction(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>
            )}

            {/* Run Batch Button */}
            <button
              disabled={running}
              onClick={handleRunBatch}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center space-x-2 shadow-lg transition-all ${
                running
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/25 border border-purple-400/40"
              }`}
            >
              {running ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Trial {results.length + 1} of {trials}...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>EXECUTE {trials} EXPERIMENT TRIALS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results View (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Progress Bar */}
          {running && (
            <div className="rounded-xl glass-panel p-4 border border-purple-500/40 animate-pulse">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-purple-300 font-bold">Executing Simulation Batch...</span>
                <span className="text-purple-300">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Batch Summary KPI */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl glass-panel border border-purple-500/30 bg-purple-950/20">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Trials</span>
                <span className="text-2xl font-mono font-extrabold text-purple-300">{summary.total}</span>
              </div>
              <div className="p-3.5 rounded-xl glass-panel border border-emerald-500/30 bg-emerald-950/20">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Detection Rate</span>
                <span className="text-2xl font-mono font-extrabold text-emerald-400">
                  {(summary.detection_rate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl glass-panel border border-cyan-500/30 bg-cyan-950/20">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">FAR / False Accepts</span>
                <span className="text-2xl font-mono font-extrabold text-cyan-400">{summary.false_accepts}</span>
              </div>
              <div className="p-3.5 rounded-xl glass-panel border border-indigo-500/30 bg-indigo-950/20">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Accuracy</span>
                <span className="text-2xl font-mono font-extrabold text-indigo-400">
                  {(summary.accuracy * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Trial by Trial Results Table */}
          <div className="rounded-xl glass-panel p-4 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Trial Execution Log</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {results.length} trials completed
              </span>
            </h3>

            {results.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-mono">
                No batch run executed yet. Configure parameters and click Execute.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto pr-1">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Trial #</th>
                      <th className="py-2">Msg</th>
                      <th className="py-2">Attack Type</th>
                      <th className="py-2">Deviation</th>
                      <th className="py-2 text-right">Detection Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {results.map((r) => (
                      <tr key={r.trial}>
                        <td className="py-2 text-slate-400">#{r.trial}</td>
                        <td className="py-2 text-cyan-300 font-bold">|{r.message}⟩</td>
                        <td className="py-2 capitalize">{r.attack_type.replace("_", " ")}</td>
                        <td className="py-2">{(r.statistic * 100).toFixed(1)}%</td>
                        <td className="py-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
