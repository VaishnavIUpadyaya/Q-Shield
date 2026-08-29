"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DashboardOverview from "@/components/DashboardOverview";
import SimulationStudio from "@/components/SimulationStudio";
import BatchExperimentRunner from "@/components/BatchExperimentRunner";
import ThreatAnalytics from "@/components/ThreatAnalytics";
import ExperimentHistory from "@/components/ExperimentHistory";
import {
  checkBackendHealth,
  runSimulation,
  getMetrics,
  getExperimentHistory,
} from "@/services/api";

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
    <div className="min-h-screen flex flex-col quantum-mesh-bg text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onQuickRun={handleQuickDemo}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-8 lg:px-10 py-10">
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

        {/* Fix #4: Connect ThreatAnalytics to live app data */}
        {activeTab === "threats" && (
          <ThreatAnalytics
            metrics={metrics}
            history={history}
          />
        )}

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

      {/* High-End Footer */}
      <footer className="glass-panel border-t border-white/[0.06] mt-16 py-8 text-sm text-slate-400">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 font-medium">
            <span className="font-display font-extrabold text-white">
              Q-SHIELD
            </span>

            <span>·</span>

            <span>
              SIH26141 Quantum-Inspired Cyber Threat Detection Framework
            </span>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Engineered with Qiskit Aer · FastAPI · Next.js · Zero AI/ML
            Mathematical Statistics
          </div>
        </div>
      </footer>
    </div>
  );
}