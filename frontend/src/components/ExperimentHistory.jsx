"use client";

import React, { useState } from "react";
import { History, Search, Download, Filter, CheckCircle2, AlertTriangle, Eye, RefreshCw, Layers, Shield } from "lucide-react";

export default function ExperimentHistory({ history, onRefresh, onSelectRun }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAttack, setFilterAttack] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.experiment_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.message || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.attack_type || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAttack = filterAttack === "all" || item.attack_type === filterAttack;

    return matchesSearch && matchesAttack;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `q_shield_experiments_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Experiment History & Dataset Log (Screen 6)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable log of all quantum executions, measurement outcomes, and threat detection decisions stored in backend/Firestore.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportJSON}
            disabled={history.length === 0}
            className="px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, message, or attack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAttack}
            onChange={(e) => setFilterAttack(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Attack Types ({history.length})</option>
            <option value="none">Legitimate Only</option>
            <option value="forgery">Forgery Attacks</option>
            <option value="channel_manipulation">Channel Manipulation</option>
            <option value="replay">Replay Attacks</option>
            <option value="impersonation">Impersonation</option>
            <option value="unauthorized_verification">Unauthorized</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl glass-panel border border-slate-800 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No experiments found in history. Run a simulation in the studio to record results.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="p-3">Experiment ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Attack Scenario</th>
                  <th className="p-3">Shots</th>
                  <th className="p-3">Deviation</th>
                  <th className="p-3">Decision</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredHistory.map((item, idx) => {
                  const detection = item.detection_result || {};
                  const isLegitimate = item.attack_type === "none" && !detection.attack_detected;
                  const isThreat = detection.attack_detected || item.attack_type !== "none";

                  return (
                    <tr key={item.experiment_id || idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 text-cyan-300 font-bold">
                        {(item.experiment_id || "EXP000").substring(0, 8)}...
                      </td>
                      <td className="p-3 text-slate-400 font-sans text-[11px]">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString() : "Just now"}
                      </td>
                      <td className="p-3 font-bold text-white">|{item.message}⟩</td>
                      <td className="p-3 capitalize text-slate-300 font-sans">
                        {item.attack_type ? item.attack_type.replace("_", " ") : "None"}
                      </td>
                      <td className="p-3">{item.shots?.toLocaleString() || 1000}</td>
                      <td className="p-3 font-mono">
                        {typeof detection.statistic === "number"
                          ? (detection.statistic * 100).toFixed(1) + "%"
                          : "0.0%"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLegitimate
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-rose-950 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {isLegitimate ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          <span>{isLegitimate ? "VERIFIED" : "DETECTED"}</span>
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b1120] border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Experiment Detail Inspector
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  ID: {selectedItem.experiment_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Target Message</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">|{selectedItem.message}⟩</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Attack Type</span>
                <span className="font-mono font-bold text-rose-300 text-sm capitalize">
                  {selectedItem.attack_type?.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Measurement Counts JSON */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                Raw Quantum Measurement Counts:
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                {JSON.stringify(selectedItem.measurements?.counts || selectedItem.measurements || {}, null, 2)}
              </pre>
            </div>

            {/* Detection Info */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-300 block">Detector Reason:</span>
              <p className="text-slate-400 text-xs font-sans">
                {selectedItem.detection_result?.reason || "Verified according to QDS protocol standard."}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
