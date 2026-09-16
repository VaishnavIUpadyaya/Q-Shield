"use client";

import React, { useMemo } from "react";
import {
  ShieldAlert,
  Binary,
  Sparkles,
} from "lucide-react";

export default function ThreatAnalytics({ metrics, history }) {
  /*
   * Static theoretical information about each supported
   * Q-SHIELD threat vector.
   *
   * The "status" value is NOT hardcoded anymore.
   * It is calculated from actual experiment history below.
   */
  const attackComparisons = [
    {
      id: "forgery",
      name: "Signature Forgery",
      quantumMechanism:
        "Attacker flips Pauli eigenstate bits in transmitted state.",
      detectorStrategy:
        "Total Variation Distance between expected single-eigenstate distribution and measured multi-state superposition.",
      thresholdFormula:
        "TV(P_expected, P_observed) > 0.10 (or 2-sigma Wilson bound)",
      theoreticalBound:
        "FAR < 10^-5 under N > 1000 shots",
    },
    {
      id: "channel_manipulation",
      name: "Quantum Channel Manipulation",
      quantumMechanism:
        "Adversary injects depolarizing, bit-flip (X), or phase-flip (Z) noise on entangled carrier qubits.",
      detectorStrategy:
        "Binomial proportion hypothesis test evaluating fidelity decay against expected correlation.",
      thresholdFormula:
        "Z-score = (|p̂ - p_0| - 1/2N) / sqrt(p_0(1-p_0)/N) > 1.96",
      theoreticalBound:
        "P_detect → 1.0 for noise p > 0.05",
    },
    {
      id: "replay",
      name: "Replay Attack",
      quantumMechanism:
        "Adversary captures authentic public verification info from previous session and re-transmits.",
      detectorStrategy:
        "Protocol freshness inspection checking sequence numbers, timestamp bounds, and one-time nonces.",
      thresholdFormula:
        "Nonce ∈ UsedNonces OR Δt > SessionWindow",
      theoreticalBound:
        "Deterministic rejection (0% FAR)",
    },
    {
      id: "impersonation",
      name: "Signer Impersonation",
      quantumMechanism:
        "Adversary Eve claims to be Alice without access to Alice's private GHZ entangled state.",
      detectorStrategy:
        "Receiver Bob's measurement fails Table 1 public key reconstruction, yielding 50/50 randomized outcomes.",
      thresholdFormula:
        "Correlation Mismatch on Bell Base Measurement",
      theoreticalBound:
        "FAR ≤ 2^-N_bits",
    },
    {
      id: "unauthorized_verification",
      name: "Unauthorized Verification",
      quantumMechanism:
        "Unregistered third-party attempts to verify signature without proper cryptographic access authorization.",
      detectorStrategy:
        "Access-control policy checking node authorization table and verification permissions.",
      thresholdFormula:
        "NodeID ∉ AuthorizedVerifiers",
      theoreticalBound:
        "Deterministic access denial",
    },
  ];

  /*
   * Normalize history so the component can safely work with:
   *
   * [
   *   {
   *     attack_type: "forgery",
   *     detection_result: {
   *       attack_detected: true
   *     }
   *   }
   * ]
   *
   * It also safely handles an empty / missing history.
   */
  const experimentHistory = useMemo(() => {
    if (Array.isArray(history)) {
      return history;
    }

    if (Array.isArray(history?.results)) {
      return history.results;
    }

    if (Array.isArray(history?.history)) {
      return history.history;
    }

    return [];
  }, [history]);

  /*
   * Calculate empirical detection statistics for every
   * attack type from actual experiment history.
   *
   * Example:
   *
   * 8 forgery experiments
   * 6 detected
   *
   * Detection Rate = 6 / 8 * 100 = 75%
   */
  const detectionStats = useMemo(() => {
    const stats = {};

    attackComparisons.forEach((attack) => {
      stats[attack.id] = {
        total: 0,
        detected: 0,
        rate: null,
      };
    });

    experimentHistory.forEach((experiment) => {
      const attackType = experiment?.attack_type;

      // Ignore legitimate baseline experiments.
      if (!attackType || attackType === "none") {
        return;
      }

      // Ignore attacks that are not part of this table.
      if (!stats[attackType]) {
        return;
      }

      stats[attackType].total += 1;

      const detected =
        experiment?.detection_result?.attack_detected === true;

      if (detected) {
        stats[attackType].detected += 1;
      }
    });

    Object.keys(stats).forEach((attackType) => {
      const { total, detected } = stats[attackType];

      stats[attackType].rate =
        total > 0 ? (detected / total) * 100 : null;
    });

    return stats;
  }, [experimentHistory]);

  /*
   * Overall detection rate.
   *
   * Prefer the actual per-experiment history calculation
   * for the attack matrix. The metrics prop is still accepted
   * because the parent application provides the global metrics.
   */
  const overallDetectionRate = useMemo(() => {
    let totalAttacks = 0;
    let detectedAttacks = 0;

    experimentHistory.forEach((experiment) => {
      const attackType = experiment?.attack_type;

      if (!attackType || attackType === "none") {
        return;
      }

      totalAttacks += 1;

      if (experiment?.detection_result?.attack_detected === true) {
        detectedAttacks += 1;
      }
    });

    if (totalAttacks === 0) {
      return metrics?.detection_rate ?? null;
    }

    return (detectedAttacks / totalAttacks) * 100;
  }, [experimentHistory, metrics]);

  /*
   * Format empirical status for the table.
   */
  const getEmpiricalStatus = (attackId) => {
    const stats = detectionStats[attackId];

    if (!stats || stats.total === 0) {
      return {
        label: "No experiments",
        className:
          "bg-slate-900 text-slate-400 border-slate-700",
      };
    }

    return {
      label: `Detected ${stats.rate.toFixed(1)}%`,
      className:
        stats.rate >= 90
          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
          : stats.rate >= 70
          ? "bg-amber-950 text-amber-300 border-amber-800"
          : "bg-rose-950 text-rose-300 border-rose-800",
    };
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Top Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8 text-quantum-cyan" />
          <span>Quantum Threat Analytics & Mathematical Theory</span>
        </h1>

        <p className="text-base text-slate-300 mt-2 font-normal">
          Rigorous mathematical justification for Q-SHIELD detection
          mechanisms across all five threat vectors — without AI or
          Machine Learning.
        </p>
      </div>

      {/* Live Detection Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-3xl glass-panel p-6 border border-white/[0.1]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Experiments Analyzed
          </span>

          <div className="mt-2 text-3xl font-extrabold font-mono text-white">
            {experimentHistory.length.toLocaleString()}
          </div>
        </div>

        <div className="rounded-3xl glass-panel p-6 border border-white/[0.1]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Overall Detection Rate
          </span>

          <div className="mt-2 text-3xl font-extrabold font-mono text-quantum-cyan">
            {overallDetectionRate !== null &&
            overallDetectionRate !== undefined
              ? `${Number(overallDetectionRate).toFixed(1)}%`
              : "No data"}
          </div>
        </div>

        <div className="rounded-3xl glass-panel p-6 border border-white/[0.1]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detection Method
          </span>

          <div className="mt-2 text-lg font-bold text-white">
            Statistical Analysis
          </div>

          <div className="text-xs text-slate-400 mt-1">
            TVD + Wilson + Binomial Testing
          </div>
        </div>
      </div>

      {/* Why No AI/ML Banner */}
      <div className="rounded-3xl glass-panel-glow-cyan p-8 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-obsidian-900 to-indigo-950/40">
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="p-4 rounded-2xl bg-cyan-500/20 text-quantum-cyan shrink-0">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Why Zero AI / Machine Learning is Required
            </h2>

            <p className="mt-2 text-base text-slate-300 leading-relaxed font-normal">
              Machine Learning models suffer from opaque decision
              boundaries ("black boxes"), vulnerability to adversarial
              perturbations, and dataset hallucinations. In contrast,
              <strong className="text-white">
                {" "}
                Q-SHIELD relies exclusively on the physical laws of
                quantum mechanics and exact statistical hypothesis testing
              </strong>{" "}
              (Total Variation Distance, Wilson Score Intervals, and
              Binomial Proportions). Every security decision is
              mathematically provable, deterministic, and fully
              explainable for security audits.
            </p>
          </div>
        </div>
      </div>

      {/* Attack Matrix Table */}
      <div className="rounded-3xl glass-panel p-8 border border-white/[0.1] space-y-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-3">
          <Binary className="w-5 h-5 text-quantum-cyan" />
          <span>Formal Threat Vector & Detection Bound Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs font-bold uppercase text-slate-400 bg-obsidian-950/80">
                <th className="p-4">Threat Vector</th>
                <th className="p-4">Quantum Physical Mechanism</th>
                <th className="p-4">Statistical Detection Strategy</th>
                <th className="p-4">Decision Bound Formula</th>
                <th className="p-4 text-right">
                  Empirical Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {attackComparisons.map((item) => {
                const status = getEmpiricalStatus(item.id);
                const stats = detectionStats[item.id];

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 font-bold text-quantum-cyan text-base">
                      {item.name}

                      {stats?.total > 0 && (
                        <div className="text-xs text-slate-500 font-mono mt-1">
                          {stats.detected}/{stats.total} detected
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-slate-300 font-sans text-sm max-w-xs leading-relaxed">
                      {item.quantumMechanism}
                    </td>

                    <td className="p-4 text-slate-200 font-sans text-sm max-w-xs leading-relaxed">
                      {item.detectorStrategy}
                    </td>

                    <td className="p-4 font-mono text-xs text-purple-300 bg-obsidian-950/50 rounded-lg">
                      {item.thresholdFormula}
                    </td>

                    <td className="p-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold border ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Data Source Explanation */}
        <div className="pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-slate-500 leading-relaxed">
            Empirical detection rates are calculated from completed
            experiments in the experiment history. Each attack rate is
            computed as detected attacks divided by total experiments
            for that attack type.
          </p>
        </div>
      </div>
    </div>
  );
}