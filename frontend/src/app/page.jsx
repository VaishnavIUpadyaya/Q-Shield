"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DashboardOverview from "@/components/DashboardOverview";
import SimulationStudio from "@/components/SimulationStudio";
import BatchExperimentRunner from "@/components/BatchExperimentRunner";
import ThreatAnalytics from "@/components/ThreatAnalytics";
import ExperimentHistory from "@/components/ExperimentHistory";
import { checkBackendHealth, runSimulation, getMetrics, getExperimentHistory } from "@/services/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [backendStatus, setBackendStatus] = useState({ online: false });
  const [metrics, setMetrics] = useState({
    total_experiments: 0,
    detection_rate: 1.0,
    false_acceptance_rate: 0.0,
    false_rejection_rate: 0.0,
    accuracy: 1.0,
  });
  const [simConfig, setSimConfig] = useState({
    message: "00",
    signing_state: "default",
    measurement_basis: "Z",
    shots: 1000,
    trials: 1,
    attack_type: "none",
    attack_fraction: 0.35,
  });
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Load initial data and poll health
  const refreshData = async () => {
    const health = await checkBackendHealth();
    setBackendStatus(health);

    const m = await getMetrics();
    setMetrics(m);

    const h = await getExperimentHistory();
    if (h && h.length > 0) {
      setHistory(h);
      if (!lastResult) {
        setLastResult(h[h.length - 1]);
      }
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const result = await runSimulation(simConfig);
      setLastResult(result);
      setHistory((prev) => [result, ...prev]);

      // Update metrics
      const updatedMetrics = await getMetrics();
      setMetrics(updatedMetrics);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPreset = (attack, msg, fraction) => {
    setSimConfig((prev) => ({
      ...prev,
      attack_type: attack,
      message: msg,
      attack_fraction: fraction,
    }));
    setActiveTab("simulation");
  };

  const handleQuickDemo = async () => {
    setActiveTab("simulation");
    setSimConfig({
      message: "00",
      signing_state: "default",
      measurement_basis: "Z",
      shots: 1000,
      trials: 1,
      attack_type: "forgery",
      attack_fraction: 0.4,
    });
    setLoading(true);
    try {
      const result = await runSimulation({
        message: "00",
        shots: 1000,
        trials: 1,
        attack_type: "forgery",
        attack_fraction: 0.4,
        measurement_basis: "Z",
      });
      setLastResult(result);
      setHistory((prev) => [result, ...prev]);
      const updatedMetrics = await getMetrics();
      setMetrics(updatedMetrics);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070f] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onQuickRun={handleQuickDemo}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <DashboardOverview
            metrics={metrics}
            onNavigateToSim={() => setActiveTab("simulation")}
            onRunPreset={handleRunPreset}
          />
        )}

        {activeTab === "simulation" && (
          <SimulationStudio
            simConfig={simConfig}
            setSimConfig={setSimConfig}
            onRunSimulation={handleRunSimulation}
            loading={loading}
            lastResult={lastResult}
          />
        )}

        {activeTab === "batch" && (
          <BatchExperimentRunner
            onExperimentCompleted={refreshData}
          />
        )}

        {activeTab === "threats" && <ThreatAnalytics />}

        {activeTab === "history" && (
          <ExperimentHistory
            history={history}
            onRefresh={refreshData}
            onSelectRun={(run) => {
              setLastResult(run);
              setActiveTab("simulation");
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-900 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">Q-SHIELD</span>
            <span>·</span>
            <span>SIH26141 Quantum-Inspired Cyber Threat Detection</span>
          </div>
          <div>
            <span>Powered by Qiskit Aer · FastAPI · Next.js · Zero AI/ML</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
