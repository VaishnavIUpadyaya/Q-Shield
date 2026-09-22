"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { downloadVerificationCertificate } from "@/services/api";
export default function ExperimentHistory({
  history,
  auditEvents = [],
  onRefresh,
  onSelectRun,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAttack, setFilterAttack] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
   const downloadCertificate = async (item) => {
  try {
    const detection = item.detection_result || {};
    const metadata = item.metadata || {};
    const verification = item.verification_result || {};

    const documentHash =
      item.document_hash ||
      verification.document_hash ||
      detection.document_hash ||
      metadata.document_hash ||
      item.hash ||
      "";

    const signerId =
      item.signer_id ||
      verification.signer_id ||
      detection.signer_id ||
      metadata.signer_id ||
      "";

    // Never generate a certificate with fake values.
    if (!documentHash) {
      alert(
        "Certificate unavailable: the actual SHA-256 document hash was not stored in this record."
      );
      return;
    }

    if (!signerId) {
      alert(
        "Certificate unavailable: the actual signer ID was not stored in this record."
      );
      return;
    }

    const verificationData = {
      document_id:
        item.document_id ||
        verification.document_id ||
        metadata.document_id ||
        item.experiment_id ||
        "unknown-document",

      signer_id: signerId,

      document_hash: documentHash,

      verification_score:
        item.verification_score ??
        verification.verification_score ??
        detection.verification_score ??
        metadata.verification_score ??
        0,

      tvd:
        item.tvd ??
        verification.tvd ??
        detection.tvd ??
        metadata.tvd ??
        null,

      valid:
        item.valid ??
        verification.valid ??
        detection.valid ??
        false,

      tampered:
        item.tampered ??
        verification.tampered ??
        detection.tampered ??
        false,

      status:
        item.status ||
        verification.status ||
        detection.status ||
        metadata.status ||
        "unknown",

      timestamp:
        item.created_at ||
        verification.timestamp ||
        metadata.timestamp ||
        new Date().toISOString(),
    };

    console.log(
      "Certificate request payload:",
      verificationData
    );

    const blob =
      await downloadVerificationCertificate(
        verificationData
      );

    const downloadUrl =
      window.URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = downloadUrl;

    anchor.download =
      `qshield_certificate_${
        verificationData.document_id
      }.pdf`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error(
      "Certificate download failed:",
      error
    );

    alert(
      `Certificate generation failed:\n\n${error.message}`
    );
  }
};
  //==
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.experiment_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.message || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.attack_type || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesAttack =
      filterAttack === "all" ||
      item.attack_type === filterAttack;

    return matchesSearch && matchesAttack;
  });

  const exportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(history, null, 2)
      );

    const downloadAnchor =
      document.createElement("a");

    downloadAnchor.setAttribute(
      "href",
      dataStr
    );

    downloadAnchor.setAttribute(
      "download",
      `q_shield_experiments_${Date.now()}.json`
    );

    document.body.appendChild(
      downloadAnchor
    );

    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white flex items-center space-x-3">
            <History className="w-8 h-8 text-quantum-cyan" />
            <span>
              Experiment History & Dataset Logs
            </span>
          </h1>

          <p className="text-base text-slate-300 mt-2 font-normal">
            Immutable log of all quantum executions,
            measurement outcomes, and threat detection
            decisions stored in backend.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-850 text-slate-300 border border-white/[0.1] text-sm font-semibold flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportJSON}
            disabled={history.length === 0}
            className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-quantum-cyan border border-cyan-500/30 text-sm font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />

          <input
            type="text"
            placeholder="Search by ID, message, or attack..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />

          <select
            value={filterAttack}
            onChange={(e) =>
              setFilterAttack(e.target.value)
            }
            className="bg-obsidian-950 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">
              All Attack Types ({history.length})
            </option>

            <option value="none">
              Legitimate Only
            </option>

            <option value="forgery">
              Forgery Attacks
            </option>

            <option value="channel_manipulation">
              Channel Manipulation
            </option>

            <option value="replay">
              Replay Attacks
            </option>

            <option value="impersonation">
              Impersonation
            </option>

            <option value="unauthorized_verification">
              Unauthorized
            </option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-3xl glass-panel border border-white/[0.1] overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm font-mono">
            No experiments found in history.
            Run a simulation in the studio to record
            results.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs font-bold uppercase text-slate-400 bg-obsidian-950/80">
                  <th className="p-4">
                    Experiment ID
                  </th>

                  <th className="p-4">
                    Timestamp
                  </th>

                  <th className="p-4">
                    Message
                  </th>

                  <th className="p-4">
                    Attack Scenario
                  </th>

                  <th className="p-4">
                    Shots
                  </th>

                  <th className="p-4">
                    Deviation
                  </th>

                  <th className="p-4">
                    Decision
                  </th>

                  <th className="p-4 text-right">
                    Inspect
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {filteredHistory.map(
                  (item, idx) => {
                    const detection =
                      item.detection_result || {};

                    /*
                     * IMPORTANT:
                     * The decision shown in the history table
                     * must reflect the detector's actual result.
                     *
                     * Do NOT infer detection from attack_type.
                     * An experiment can contain an attack but the
                     * detector may fail to detect it.
                     */
                    const isThreat =
                      detection.attack_detected === true;

                    const isLegitimate =
                      !isThreat;

                    return (
                      <tr
                        key={
                          item.experiment_id || idx
                        }
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4 text-quantum-cyan font-bold">
                          {(
                            item.experiment_id ||
                            "EXP000"
                          ).substring(0, 8)}
                          ...
                        </td>

                        <td className="p-4 text-slate-400 font-sans text-xs">
                          {item.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleTimeString()
                            : "Just now"}
                        </td>

                        <td className="p-4 font-bold text-white">
                          |{item.message}⟩
                        </td>

                        <td className="p-4 capitalize text-slate-200 font-sans">
                          {item.attack_type
                            ? item.attack_type.replace(
                                "_",
                                " "
                              )
                            : "None"}
                        </td>

                        <td className="p-4">
                          {item.shots?.toLocaleString() ||
                            1000}
                        </td>

                        <td className="p-4 font-mono font-bold">
                          {typeof detection.deviation ===
                          "number"
                            ? (
                                detection.deviation *
                                100
                              ).toFixed(1) + "%"
                            : typeof detection.statistic ===
                              "number"
                            ? (
                                detection.statistic *
                                100
                              ).toFixed(1) + "%"
                            : "0.0%"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                              isLegitimate
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-rose-950 text-rose-300 border border-rose-800"
                            }`}
                          >
                            {isLegitimate ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}

                            <span>
                              {isLegitimate
                                ? "VERIFIED"
                                : "DETECTED"}
                            </span>
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() =>
                              setSelectedItem(item)
                            }
                            className="p-2 rounded-xl bg-obsidian-950 hover:bg-cyan-500/20 hover:text-quantum-cyan text-slate-400 border border-white/[0.06] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
{/* Document Audit Events Panel */}
<div className="rounded-3xl glass-panel border border-white/[0.1] overflow-hidden">
  <div className="p-6 border-b border-white/[0.08]">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-display font-bold text-white">
          Document Audit Events
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Verification, rejection, and tamper-detection records.
        </p>
      </div>

      <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-quantum-cyan text-xs font-bold">
        {auditEvents.length} EVENTS
      </span>
    </div>
  </div>

  {auditEvents.length === 0 ? (
    <div className="p-8 text-center text-slate-400 text-sm font-mono">
      No document audit events available.
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm font-mono border-collapse">
        <thead>
          <tr className="border-b border-white/[0.08] text-xs font-bold uppercase text-slate-400 bg-obsidian-950/80">
            <th className="p-4">
              Event Type
            </th>

            <th className="p-4">
              Document ID
            </th>

            <th className="p-4">
              Timestamp
            </th>

            <th className="p-4">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/[0.04] text-slate-300">
          {auditEvents.map((event, index) => {
            const eventType =
              event.event_type || "unknown";

            const isTamper =
              eventType === "tamper_detected" ||
              eventType === "verification_rejected";

            return (
              <tr
                key={event.event_id || index}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-4">
                  <span
                    className={
                      isTamper
                        ? "text-rose-300"
                        : "text-emerald-300"
                    }
                  >
                    {eventType.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="p-4 text-quantum-cyan text-xs">
                  {(event.document_id || "Unknown").substring(
                    0,
                    16
                  )}
                  ...
                </td>

                <td className="p-4 text-slate-400 text-xs font-sans">
                  {event.created_at
                    ? new Date(
                        event.created_at
                      ).toLocaleString()
                    : "Unknown"}
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                      isTamper
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {isTamper ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}

                    {isTamper
                      ? "REVIEW"
                      : "RECORDED"}
                  </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-obsidian-900 border border-white/[0.12] rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-mono text-quantum-cyan uppercase tracking-wider block font-bold">
                  Experiment Detail Inspector
                </span>

                <h3 className="text-lg font-bold text-white font-mono mt-1">
                  ID:{" "}
                  {selectedItem.experiment_id}
                </h3>
              </div>

              <button
                onClick={() =>
                  setSelectedItem(null)
                }
                className="text-slate-400 hover:text-white text-sm font-mono px-3 py-1.5 bg-obsidian-950 rounded-xl border border-white/[0.06]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.06]">
                <span className="text-slate-400 text-xs block uppercase font-medium">
                  Target Message
                </span>

                <span className="font-mono font-bold text-quantum-cyan text-base mt-1 block">
                  |{selectedItem.message}⟩
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.06]">
                <span className="text-slate-400 text-xs block uppercase font-medium">
                  Attack Scenario
                </span>

                <span className="font-mono font-bold text-rose-400 text-base mt-1 block capitalize">
                  {selectedItem.attack_type?.replace(
                    "_",
                    " "
                  )}
                </span>
              </div>
            </div>

            {/* Measurement Counts JSON */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                Raw Quantum Measurement Counts:
              </span>

              <pre className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.08] text-xs font-mono text-quantum-cyan overflow-x-auto">
                {JSON.stringify(
                  selectedItem.measurements
                    ?.counts ||
                    selectedItem.measurements ||
                    {},
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Detection Info */}
            <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.08] text-sm space-y-1.5">
              <span className="font-bold text-white block">
                Detector Rationale:
              </span>

              <p className="text-slate-300 text-sm font-sans leading-relaxed">
                {selectedItem.detection_result
                  ?.reason ||
                  "Verified according to QDS protocol standard."}
              </p>
            </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              {/* <button
                onClick={() =>
                  downloadCertificate(selectedItem)
                }
                className="px-6 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-quantum-cyan border border-cyan-500/30 text-sm font-bold font-display flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF Certificate
              </button> */}

              <button
                onClick={() =>
                  setSelectedItem(null)
                }
                className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-sm font-bold font-display"
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