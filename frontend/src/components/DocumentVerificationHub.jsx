"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  FileCheck2,
  Zap,
  RefreshCw,
  Activity,
  ChevronDown,
} from "lucide-react";

import {
  verifyDocument,
  simulateDocumentTampering,
} from "@/services/api";

export default function DocumentVerificationHub() {
  const [documentFile, setDocumentFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [error, setError] = useState("");
  const [showMathAudit, setShowMathAudit] = useState(false);

  const handleVerify = async (fileToVerify = documentFile) => {
    if (!fileToVerify || !signatureFile) {
      setError(
        "Please select both the original document and its .qseal file."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const verification = await verifyDocument(
        fileToVerify,
        signatureFile,
        100
      );

      setResult(verification);
    } catch (err) {
      setError(err.message || "Document verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleTamperSimulation = async () => {
    if (!documentFile || !signatureFile) {
      setError("Upload a document and .qseal file first.");
      return;
    }

    setTampering(true);
    setError("");
    setResult(null);

    try {
      const tamperedFile = await simulateDocumentTampering(documentFile);

      const verification = await verifyDocument(
        tamperedFile,
        signatureFile,
        100
      );

      setResult({
        ...verification,
        simulatedAttack: true,
      });
    } catch (err) {
      setError(err.message || "Tamper simulation failed.");
    } finally {
      setTampering(false);
    }
  };

  const isValid = result?.valid === true;

  const telemetry = result?.telemetry || {};

  const tvd =
    telemetry.tvd !== undefined
      ? Number(telemetry.tvd).toFixed(4)
      : "—";

  const wilsonCI = Array.isArray(telemetry.wilson_ci)
    ? `${Number(telemetry.wilson_ci[0]).toFixed(4)} – ${Number(
        telemetry.wilson_ci[1]
      ).toFixed(4)}`
    : "—";

  const zzCorrelation =
    telemetry.pauli_projection_correlations?.ZZ !== undefined
      ? Number(
          telemetry.pauli_projection_correlations.ZZ
        ).toFixed(4)
      : "—";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3">
            <ShieldCheck className="h-6 w-6 text-cyan-300" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">
              Document Verification Hub
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Verify document authenticity and detect tampering using Q-Shield.
            </p>
          </div>
        </div>
      </div>

      {/* Upload panel */}
      <div className="glass-panel p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Document */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Original Document
            </label>

            <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-950/30 px-4 text-center transition hover:border-cyan-400/50 hover:bg-cyan-400/5">
              <Upload className="mb-3 h-7 w-7 text-cyan-300" />

              <span className="text-sm text-slate-300">
                {documentFile
                  ? documentFile.name
                  : "Choose the document to verify"}
              </span>

              <span className="mt-1 text-xs text-slate-500">
                Any document file
              </span>

              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  setDocumentFile(event.target.files?.[0] || null);
                  setResult(null);
                  setError("");
                }}
              />
            </label>
          </div>

          {/* Signature */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Quantum Seal (.qseal)
            </label>

            <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-950/30 px-4 text-center transition hover:border-purple-400/50 hover:bg-purple-400/5">
              <FileCheck2 className="mb-3 h-7 w-7 text-purple-300" />

              <span className="text-sm text-slate-300">
                {signatureFile
                  ? signatureFile.name
                  : "Choose the .qseal signature"}
              </span>

              <span className="mt-1 text-xs text-slate-500">
                Quantum document signature
              </span>

              <input
                type="file"
                accept=".qseal,.json,application/json"
                className="hidden"
                onChange={(event) => {
                  setSignatureFile(event.target.files?.[0] || null);
                  setResult(null);
                  setError("");
                }}
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={
              loading ||
              tampering ||
              !documentFile ||
              !signatureFile
            }
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}

            {loading ? "Verifying..." : "Verify Document"}
          </button>

          <button
            type="button"
            onClick={handleTamperSimulation}
            disabled={
              loading ||
              tampering ||
              !documentFile ||
              !signatureFile
            }
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {tampering ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}

            {tampering
              ? "Simulating..."
              : "Simulate Adversary Tampering"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Verification result */}
      {result && (
        <div
          className={`glass-panel p-6 ${
            isValid
              ? "border border-emerald-400/20"
              : "border border-red-400/20"
          }`}
        >
          {/* Result header */}
          <div className="flex items-start gap-4">
            <div
              className={`rounded-xl p-3 ${
                isValid
                  ? "bg-emerald-400/10"
                  : "bg-red-400/10"
              }`}
            >
              {isValid ? (
                <ShieldCheck className="h-7 w-7 text-emerald-300" />
              ) : (
                <ShieldAlert className="h-7 w-7 text-red-300" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3
                  className={`text-xl font-semibold ${
                    isValid
                      ? "text-emerald-200"
                      : "text-red-200"
                  }`}
                >
                  {isValid ? "AUTHENTIC" : "TAMPER DETECTED"}
                </h3>

                {result.simulatedAttack && (
                  <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs font-medium text-red-200">
                    Adversary simulation
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-slate-400">
                {isValid
                  ? "The document matches the supplied quantum seal."
                  : "The document does not match the supplied quantum seal. The observed verification results indicate a modification or invalid signature."}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Verification Score"
              value={
                result.verification_score !== undefined
                  ? `${(
                      Number(result.verification_score) * 100
                    ).toFixed(2)}%`
                  : "—"
              }
            />

            <MetricCard
              label="Valid Blocks"
              value={result.valid_blocks ?? "—"}
            />

            <MetricCard
              label="Invalid Blocks"
              value={result.invalid_blocks ?? "—"}
            />

            <MetricCard
              label="Total Blocks"
              value={result.total_blocks ?? "—"}
            />
          </div>

          {/* Quantum Telemetry Inspector */}
          <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-950/30 p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-300" />

              <h4 className="font-medium text-white">
                Quantum Telemetry Inspector
              </h4>
            </div>

            {/* Primary telemetry */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <TelemetryItem
                label="Status"
                value={
                  result.status ||
                  (isValid ? "verified" : "failed")
                }
              />

              <TelemetryItem
                label="Signer"
                value={result.signer_id || "Unknown"}
              />

              <TelemetryItem
                label="Tampered"
                value={result.tampered ? "Yes" : "No"}
              />

              <TelemetryItem
                label="TVD"
                value={tvd}
              />

              <TelemetryItem
                label="Wilson 95% CI"
                value={wilsonCI}
              />
            </div>

            {/* Quantum measurements */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TelemetryItem
                label="Pauli Z⊗Z Correlation"
                value={zzCorrelation}
              />

              <TelemetryItem
                label="Quantum Shots"
                value={
                  telemetry.total_shots !== undefined
                    ? telemetry.total_shots
                    : "—"
                }
              />
            </div>

            {/* Extra statistics */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TelemetryItem
                label="Successful Shots"
                value={
                  telemetry.successful_shots !== undefined
                    ? telemetry.successful_shots
                    : "—"
                }
              />

              <TelemetryItem
                label="Confidence Level"
                value={
                  telemetry.wilson_confidence !== undefined
                    ? `${(
                        Number(
                          telemetry.wilson_confidence
                        ) * 100
                      ).toFixed(0)}%`
                    : "—"
                }
              />
            </div>

            {/* Verification Details */}
            {result.details && (
              <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Verification Details
                </p>

                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                  {typeof result.details === "string"
                    ? result.details
                    : JSON.stringify(
                        result.details,
                        null,
                        2
                      )}
                </pre>
              </div>
            )}
          </div>

          {/* Quantum Math Audit */}
          <div className="mt-6 rounded-xl border border-purple-400/20 bg-purple-400/5">
            <button
              type="button"
              onClick={() =>
                setShowMathAudit(!showMathAudit)
              }
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <h4 className="font-medium text-white">
                  Quantum Math Audit
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  View the statistical and quantum calculations
                  used during verification.
                </p>
              </div>

              <ChevronDown
                className={`h-5 w-5 text-purple-300 transition-transform ${
                  showMathAudit
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {showMathAudit && (
              <div className="border-t border-purple-400/10 px-5 py-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <MathAuditCard
                    title="Total Variation Distance"
                    value={tvd}
                    description="Measures the difference between expected and observed outcome distributions. Lower values indicate closer agreement."
                  />

                  <MathAuditCard
                    title="Wilson Confidence Interval"
                    value={wilsonCI}
                    description="95% confidence interval for the observed verification success proportion."
                  />

                  <MathAuditCard
                    title="Pauli Z⊗Z Projection"
                    value={zzCorrelation}
                    description="Two-qubit correlation calculated from the Z-basis measurement outcomes."
                  />
                </div>

                <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Interpretation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Q-Shield compares the measured quantum
                    outcomes against the expected document
                    signature. TVD captures distribution
                    deviation, the Wilson interval represents
                    statistical uncertainty, and the Z⊗Z
                    projection records the observed two-qubit
                    correlation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !error && (
        <div className="glass-panel p-8 text-center">
          <Activity className="mx-auto h-8 w-8 text-slate-500" />

          <p className="mt-3 text-sm text-slate-400">
            Upload a document and its quantum seal to begin
            verification.
          </p>
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function TelemetryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-200">
        {String(value)}
      </p>
    </div>
  );
}

function MathAuditCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}