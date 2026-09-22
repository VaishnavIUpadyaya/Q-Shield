"use client";

import { useState } from "react";
import { FileSignature, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { signDocument } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export default function DocumentSigningHub() {
  const { user } = useAuth();

  const [documentFile, setDocumentFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSign = async () => {
    if (!documentFile) {
      setError("Please select a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const signerId = user?.username || "Alice";

      const signingResult = await signDocument(
        documentFile,
        signerId
      );

      setResult(signingResult);
    } catch (err) {
      setError(err.message || "Document signing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSeal = () => {
  if (!result) return;

  const qseal = {
    document_id: result.document_hash,
    document_hash: result.document_hash,
    signer_id: result.signer_id,
    total_blocks: result.total_blocks,
    quantum_seal: result.quantum_seal,
    signatures: result.signatures,
    created_at: result.created_at,
    status: result.status,
  };

  const blob = new Blob(
    [JSON.stringify(qseal, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
 const shortHash = result.document_hash
  ? result.document_hash.slice(0, 12)
  : "document";

const signer = result.signer_id || "unknown";

link.download = `QShield_Quantum_Seal_${signer}_${shortHash}.qseal`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Document Signing
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Sign a document using the Xu-Wang Quantum Digital Signature protocol.
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-6">
        <div className="mb-5 flex items-center gap-3">
          <FileSignature className="h-5 w-5 text-cyan-400" />

          <div>
            <h2 className="font-medium text-white">
              Quantum Document Signing
            </h2>

            <p className="text-xs text-slate-400">
              Signer: {user?.username || "Alice"}
            </p>
          </div>
        </div>

        <input
          type="file"
          onChange={(event) => {
            setDocumentFile(event.target.files?.[0] || null);
            setResult(null);
            setError("");
          }}
          className="block w-full text-sm text-slate-300
            file:mr-4 file:rounded-lg file:border-0
            file:bg-cyan-500/10 file:px-4 file:py-2
            file:text-sm file:font-medium file:text-cyan-300
            hover:file:bg-cyan-500/20"
        />

        {documentFile && (
          <p className="mt-3 text-xs text-slate-400">
            Selected: {documentFile.name}
          </p>
        )}

        <button
          type="button"
          onClick={handleSign}
          disabled={!documentFile || loading}
          className="mt-5 inline-flex items-center gap-2 rounded-lg
            bg-cyan-500 px-5 py-2.5 text-sm font-semibold
            text-slate-950 transition
            hover:bg-cyan-400
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileSignature className="h-4 w-4" />

          {loading ? "Signing..." : "Sign Document"}
        </button>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-lg
            border border-rose-500/20 bg-rose-500/5 p-4
            text-sm text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-2xl border border-emerald-500/20
          bg-slate-950/60 p-6"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />

            <h2 className="font-medium text-white">
              Document Signed Successfully
            </h2>
          </div>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">
                Signer
              </p>
              <p className="font-mono text-slate-200">
                {result.signer_id}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                SHA-256 Document Hash
              </p>
              <p className="break-all font-mono text-xs text-cyan-300">
                {result.document_hash}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Quantum Blocks
              </p>
              <p className="text-slate-200">
                {result.total_blocks}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Created At
              </p>
              <p className="text-slate-200">
                {result.created_at}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Status
              </p>
              <p className="font-medium text-emerald-400">
                {result.status}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSeal}
            className="mt-6 inline-flex items-center gap-2
              rounded-lg border border-cyan-500/30
              bg-cyan-500/10 px-4 py-2.5 text-sm
              font-medium text-cyan-300
              hover:bg-cyan-500/20"
          >
            <Download className="h-4 w-4" />
            Download Quantum Seal
          </button>
        </div>
      )}
    </div>
  );
}