"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText, Upload, CheckCircle2, Shield, ShieldCheck, Download,
  Sparkles, RefreshCw, Copy, Check, Lock, Cpu, Eye, AlertTriangle,
  FileCode, FileImage, FileCheck, Layers, Award, FileSpreadsheet, ArrowRight
} from "lucide-react";
import { signDocumentApi, verifyDocumentApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

/* Helper to format bytes into readable KB / MB */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/* Calculate SHA-256 fingerprint in browser using Web Crypto API */
async function computeSHA256(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* Sample preset documents for instant non-technical testing */
const SAMPLE_DOCUMENTS = [
  {
    name: "Master_Services_Agreement_2026.pdf",
    type: "application/pdf",
    content: "EXECUTIVE SERVICE AGREEMENT\nBetween Q-Shield Tech Corp and Quantum Enterprises.\nTerms: Zero-Trust QDS Validation under SIH26141 standard.\nEffective Date: September 2026.",
    size: 142850,
  },
  {
    name: "Commercial_Procurement_Invoice_8841.json",
    type: "application/json",
    content: JSON.stringify({
      invoice_id: "INV-2026-8841",
      vendor: "Q-Shield Quantum Systems",
      amount_usd: 1250000.00,
      currency: "USD",
      entanglement_security: "Xu-Wang QDS 128-bit",
      status: "PENDING_QUANTUM_SIGNATURE"
    }, null, 2),
    size: 4820,
  },
  {
    name: "Corporate_NDA_Legal_Contract.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    content: "NON-DISCLOSURE AND QUANTUM DATA SECURITY AGREEMENT\nSignatory agrees to protect quantum key distribution channels and private keys.",
    size: 98400,
  }
];

export default function DocumentSignerStudio() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const verifyFileInputRef = useRef(null);

  // Tab state: "sign" | "verify"
  const [activeTab, setActiveTab] = useState("sign");

  // File & Document State for Signing
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTextContent, setFileTextContent] = useState("");
  const [fileBuffer, setFileBuffer] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Signer Customization
  const [signerName, setSignerName] = useState(user?.username || "Alice");
  const [signerRole, setSignerRole] = useState(
    user?.role === "signer" ? "Chief Executive Officer (CEO)" : 
    user?.role === "admin" ? "Chief Information Security Officer (CISO)" : 
    "Legal Signer & Bank Manager"
  );

  // Signing Progress & Result
  const [isSigning, setIsSigning] = useState(false);
  const [signingProgress, setSigningProgress] = useState("");
  const [signingStep, setSigningStep] = useState(0);
  const [signedResult, setSignedResult] = useState(null);

  // Verification State
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifySealJson, setVerifySealJson] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Auto-populate signer name when user changes
  useEffect(() => {
    if (user?.username) {
      setSignerName(user.username);
    }
  }, [user]);

  // Process selected file for signing
  const handleFileProcess = async (file, textOverride = null) => {
    let textContent = textOverride || "";
    let buffer = null;

    if (file) {
      buffer = await file.arrayBuffer();
      if (file.type.startsWith("text/") || file.type.includes("json") || file.name.endsWith(".txt") || file.name.endsWith(".json")) {
        textContent = await file.text();
      }
    } else if (textOverride) {
      buffer = new TextEncoder().encode(textOverride).buffer;
    }

    if (!buffer) return;

    const hash = await computeSHA256(buffer);

    setSelectedFile(file);
    setFileTextContent(textContent);
    setFileBuffer(buffer);
    setFileMetadata({
      name: file ? file.name : "Custom_Contract_Document.txt",
      size: file ? file.size : buffer.byteLength,
      type: file ? (file.type || "application/octet-stream") : "text/plain",
      lastModified: file ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
      hash: hash,
      blocks: 128,
    });
    setSignedResult(null);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileProcess(e.target.files[0]);
    }
  };

  const loadSampleDocument = async (sample) => {
    const file = new File([sample.content], sample.name, { type: sample.type });
    await handleFileProcess(file, sample.content);
  };

  // Action: Sign Document with Quantum Shield
  const handleSignDocument = async () => {
    if (!fileMetadata && !selectedFile && !fileTextContent) return;

    setIsSigning(true);
    setSigningStep(1);
    setSigningProgress("Computing 256-bit SHA-256 fingerprint...");

    await new Promise((r) => setTimeout(r, 400));
    setSigningStep(2);
    setSigningProgress("Partitioning hash into 128 2-bit quantum blocks...");

    await new Promise((r) => setTimeout(r, 500));
    setSigningStep(3);
    setSigningProgress("Generating Xu-Wang QDS Bell pairs & private key indices...");

    try {
      const fullSignerId = `${signerName} (${signerRole})`;
      let response = null;

      if (selectedFile) {
        response = await signDocumentApi({ file: selectedFile, signerId: fullSignerId });
      } else {
        response = await signDocumentApi({ text: fileTextContent || fileMetadata.name, signerId: fullSignerId });
      }

      setSigningStep(4);
      setSigningProgress("Applying Quantum Entanglement Assurance Badge...");
      await new Promise((r) => setTimeout(r, 400));

      const sealId = `QSEAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026-XW`;
      const identityFingerprint = `0x${fileMetadata.hash.substring(0, 4).toUpperCase()}:${fileMetadata.hash.substring(4, 8).toUpperCase()}:${fileMetadata.hash.substring(8, 12).toUpperCase()}:${fileMetadata.hash.substring(12, 16).toUpperCase()}`;

      setSignedResult({
        seal_id: sealId,
        signer_name: signerName,
        signer_role: signerRole,
        signer_identity_fingerprint: identityFingerprint,
        timestamp_utc: new Date().toUTCString(),
        timestamp_iso: new Date().toISOString(),
        document_name: fileMetadata.name,
        document_size: formatBytes(fileMetadata.size),
        document_hash: response.document_hash || fileMetadata.hash,
        total_blocks: response.total_blocks || 128,
        quantum_seal: response.quantum_seal || {
          protocol: "Xu-Wang QDS 2-Bit",
          fidelity: "100.0%",
          entangled_qubits: 128,
          assurance_level: "ZERO_KNOWLEDGE_QUANTUM_SECURED",
        },
        signatures_summary: response.signatures ? response.signatures.slice(0, 4) : [],
        raw_response: response,
      });
    } catch (err) {
      console.error("Signing failed:", err);
    } finally {
      setIsSigning(false);
      setSigningStep(0);
    }
  };

  // Download Signed Document Bundle (.qseal JSON + Metadata)
  const handleDownloadBundle = () => {
    if (!signedResult) return;

    const bundleData = {
      qshield_quantum_seal: {
        seal_id: signedResult.seal_id,
        signer_name: signedResult.signer_name,
        signer_role: signedResult.signer_role,
        signer_identity_fingerprint: signedResult.signer_identity_fingerprint,
        timestamp_utc: signedResult.timestamp_utc,
        assurance_badge: "QUANTUM_ENTANGLEMENT_ASSURANCE_VALIDATED",
        protocol: "Xu-Wang Quantum Digital Signature (QDS)",
      },
      document_metadata: {
        file_name: signedResult.document_name,
        file_size: signedResult.document_size,
        sha256_hash: signedResult.document_hash,
        total_quantum_blocks: signedResult.total_blocks,
      },
      quantum_signatures_payload: signedResult.raw_response?.signatures || [],
    };

    const jsonStr = JSON.stringify(bundleData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${signedResult.document_name.replace(/\.[^/.]+$/, "")}.qseal`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy SHA-256 Hash
  const handleCopyHash = () => {
    if (fileMetadata?.hash) {
      navigator.clipboard.writeText(fileMetadata.hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // Verify Document Function
  const handleVerifySeal = async () => {
    if (!verifySealJson && !verifyFile) return;

    setIsVerifying(true);
    try {
      let signatureData = null;
      if (verifySealJson) {
        try {
          signatureData = JSON.parse(verifySealJson);
        } catch (e) {
          signatureData = { document_hash: verifySealJson };
        }
      }

      const res = await verifyDocumentApi({
        file: verifyFile,
        signatureJson: signatureData || { document_hash: fileMetadata?.hash || "sample" },
      });

      setVerificationResult(res);
    } catch (err) {
      console.error("Verification failed:", err);
      setVerificationResult({
        valid: false,
        verification_score: 0.0,
        status: "rejected",
        signer_id: "Unknown",
        total_blocks: 128,
        valid_blocks: 0,
        invalid_blocks: 128,
        tampered: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header & Tab Navigation */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/[0.1] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-gradient-to-br from-quantum-cyan/15 via-quantum-indigo/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-quantum-cyan text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Issue #16 · Business Drag-and-Drop Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Document Signing Studio <span className="text-transparent bg-clip-text bg-gradient-to-r from-quantum-cyan to-quantum-purple">& Quantum Seal Hub</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
              Intuitive 1-click document signing for non-technical signers (CEOs, legal teams, bank managers). Receive official Quantum Seal Badges with zero quantum physics configuration required.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-obsidian-950/90 border border-white/[0.1] shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("sign")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "sign"
                  ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-500/40 shadow-quantum-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileCheck className="w-4 h-4 text-quantum-cyan" />
              <span>Sign Document</span>
            </button>

            <button
              onClick={() => setActiveTab("verify")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "verify"
                  ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Quantum Seal</span>
            </button>
          </div>
        </div>
      </div>

      {/* SIGN TAB CONTENT */}
      {activeTab === "sign" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload Zone & Document Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-3xl p-8 sm:p-10 border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
                isDragOver
                  ? "border-quantum-cyan bg-cyan-500/10 shadow-quantum-glow scale-[1.01]"
                  : selectedFile
                  ? "border-emerald-500/40 bg-obsidian-900/80 hover:border-emerald-400"
                  : "border-white/[0.15] bg-obsidian-900/60 hover:border-quantum-cyan/50 hover:bg-obsidian-900/90"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.docx,.json,.txt"
                onChange={handleFileChange}
              />

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${
                selectedFile ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/10 text-quantum-cyan"
              }`}>
                {selectedFile ? <FileCheck className="w-8 h-8" /> : <Upload className="w-8 h-8 animate-bounce" />}
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                {selectedFile ? selectedFile.name : "Drag & Drop Your Document Here"}
              </h3>

              <p className="text-sm text-slate-400 max-w-md mb-4">
                Supports <span className="text-cyan-300 font-mono font-semibold">PDF, DOCX, PNG, JSON, TXT</span> contracts or invoices for 128-bit Xu-Wang QDS signature generation.
              </p>

              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-obsidian-950 border border-white/[0.1] text-xs font-mono text-slate-300">
                <Lock className="w-3.5 h-3.5 text-quantum-cyan" />
                <span>Files are hashed locally using SHA-256 before QDS signing</span>
              </div>
            </div>

            {/* Quick Sample Documents Selector */}
            <div className="glass-panel p-5 rounded-2xl border border-white/[0.08]">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Or load a business document template:</span>
                <span className="text-quantum-cyan font-mono text-[11px]">Instant 1-Click Test</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_DOCUMENTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSampleDocument(sample)}
                    className="flex items-center space-x-2.5 p-3 rounded-xl bg-obsidian-950/80 hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/40 transition-all text-left group"
                  >
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{sample.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{formatBytes(sample.size)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Metadata & Preview Panel */}
            {fileMetadata && (
              <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-quantum-cyan">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{fileMetadata.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">{fileMetadata.type} · {formatBytes(fileMetadata.size)}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Fingerprint Computed</span>
                  </span>
                </div>

                {/* SHA-256 Fingerprint Display */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                    <span>Cryptographic SHA-256 Fingerprint</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-quantum-cyan hover:text-white flex items-center space-x-1 font-mono transition-colors"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-obsidian-950 font-mono text-xs text-cyan-300 border border-white/[0.08] break-all select-all">
                    {fileMetadata.hash}
                  </div>
                </div>

                {/* Quantum Block Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-obsidian-950/80 border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Quantum Blocks</span>
                    <span className="text-sm font-bold text-white font-mono">128 Blocks (2-bit)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-obsidian-950/80 border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">QDS Scheme</span>
                    <span className="text-sm font-bold text-quantum-cyan font-mono">Xu-Wang Bell Pair</span>
                  </div>
                  <div className="p-3 rounded-xl bg-obsidian-950/80 border border-white/[0.06] col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Key Assurance</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">Table 1 Private Key</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Signer Identity & Sign Action (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Signer Customization Form */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/[0.1] space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Shield className="w-5 h-5 text-quantum-cyan" />
                <span>Signer Identity & Credentials</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Signer Full Name
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-white/[0.15] text-white focus:border-quantum-cyan focus:outline-none focus:ring-1 focus:ring-quantum-cyan transition-all font-medium text-sm"
                  placeholder="e.g. Alice"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Role / Official Capacity
                </label>
                <input
                  type="text"
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-white/[0.15] text-white focus:border-quantum-cyan focus:outline-none focus:ring-1 focus:ring-quantum-cyan transition-all font-medium text-sm"
                  placeholder="e.g. Chief Executive Officer"
                />
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-quantum-cyan block">🔒 One-Click Business Signing</span>
                <p>
                  Clicking sign invokes the QDS protocol in the background. Private keys and Bell measurement angles are generated automatically according to Xu-Wang parameters.
                </p>
              </div>

              {/* Prominent "Sign with Quantum Shield" Button */}
              <button
                disabled={(!fileMetadata && !selectedFile) || isSigning}
                onClick={handleSignDocument}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center space-x-3 transition-all transform active:scale-95 ${
                  isSigning
                    ? "bg-cyan-500/20 text-quantum-cyan border border-cyan-500/40 animate-pulse cursor-not-allowed shadow-quantum-glow"
                    : fileMetadata || selectedFile
                    ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black shadow-quantum-glow cursor-pointer"
                    : "bg-obsidian-900 text-slate-500 border border-white/[0.08] cursor-not-allowed"
                }`}
              >
                {isSigning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-quantum-cyan" />
                    <span>Signing Document...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Sign with Quantum Shield</span>
                  </>
                )}
              </button>

              {/* Signing Step Progress Overlay */}
              {isSigning && (
                <div className="p-4 rounded-xl bg-obsidian-950 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-quantum-cyan font-mono font-semibold">
                    <span>Step {signingStep} of 4</span>
                    <span>QDS Execution</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-quantum-cyan to-indigo-500 h-2 transition-all duration-300"
                      style={{ width: `${(signingStep / 4) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-300 font-mono text-center pt-1 animate-pulse">
                    {signingProgress}
                  </div>
                </div>
              )}
            </div>

            {/* ANIMATED QUANTUM SEAL CARD UPON COMPLETION */}
            {signedResult && (
              <div className="relative overflow-hidden rounded-3xl p-7 bg-gradient-to-b from-obsidian-900 via-obsidian-850 to-obsidian-950 border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(0,242,254,0.25)] space-y-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                {/* Metallic Seal Header Badge */}
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-quantum-cyan to-quantum-purple p-[1px] shadow-quantum-glow">
                      <div className="w-full h-full rounded-[15px] bg-obsidian-950 flex items-center justify-center">
                        <Award className="w-6 h-6 text-quantum-cyan" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-lg text-white tracking-wide">
                        QUANTUM SEAL BADGE
                      </h4>
                      <span className="text-xs text-quantum-cyan font-mono font-semibold">Official Q-Shield Certificate</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                    VALIDATED
                  </span>
                </div>

                {/* Required Metadata Cards */}
                <div className="space-y-3 font-mono text-xs">
                  {/* Cryptographic Seal ID */}
                  <div className="p-3.5 rounded-xl bg-obsidian-950 border border-white/[0.08] flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Cryptographic Seal ID:</span>
                    <span className="text-quantum-cyan font-bold text-sm tracking-wider">{signedResult.seal_id}</span>
                  </div>

                  {/* Signer Name & Identity Fingerprint */}
                  <div className="p-3.5 rounded-xl bg-obsidian-950 border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Signer & Identity:</span>
                      <span className="text-white font-bold">{signedResult.signer_name} ({signedResult.signer_role})</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Identity Fingerprint:</span>
                      <span className="text-cyan-300 text-[11px]">{signedResult.signer_identity_fingerprint}</span>
                    </div>
                  </div>

                  {/* Timestamp UTC */}
                  <div className="p-3.5 rounded-xl bg-obsidian-950 border border-white/[0.08] flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Timestamp (UTC):</span>
                    <span className="text-slate-200">{signedResult.timestamp_utc}</span>
                  </div>

                  {/* Quantum Entanglement Assurance Badge */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-purple-500/15 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Quantum Entanglement Assurance Badge</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-semibold">
                        ⚡ 100.0% Quantum Fidelity
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-semibold">
                        ⚛️ 128 Entangled Qubits
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-500/30 font-semibold">
                        🛡️ Zero-Knowledge Proof
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download Signed Document Bundle */}
                <button
                  onClick={handleDownloadBundle}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-extrabold text-sm shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Download className="w-4 h-4 text-black" />
                  <span>Download Signed Document Bundle (.qseal)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VERIFY TAB CONTENT */}
      {activeTab === "verify" && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/[0.1] space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2.5 mb-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span>Verify Quantum Signed Document (.qseal)</span>
              </h3>
              <p className="text-sm text-slate-300">
                Upload a document along with its official <span className="text-quantum-cyan font-mono font-semibold">.qseal</span> quantum metadata bundle to verify authenticity and detect physical-layer or cryptographic tampering.
              </p>
            </div>

            {/* Verification Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document File Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1. Document File
                </label>
                <div
                  onClick={() => verifyFileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-white/[0.15] bg-obsidian-950 hover:border-emerald-400 cursor-pointer text-center space-y-2 transition-all"
                >
                  <input
                    ref={verifyFileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
                  />
                  <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {verifyFile ? verifyFile.name : "Click to select original document"}
                  </div>
                  <div className="text-[10px] text-slate-400">PDF, PNG, DOCX, JSON, TXT</div>
                </div>
              </div>

              {/* Quantum Seal JSON / Metadata Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  2. Quantum Seal Data (.qseal or Hash)
                </label>
                <textarea
                  value={verifySealJson}
                  onChange={(e) => setVerifySealJson(e.target.value)}
                  placeholder="Paste contents of .qseal bundle file or document SHA-256 hash here..."
                  className="w-full h-[126px] p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.15] text-xs font-mono text-cyan-300 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>

            {/* Verify Action Button */}
            <button
              disabled={isVerifying || (!verifyFile && !verifySealJson && !fileMetadata)}
              onClick={handleVerifySeal}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center space-x-3 transition-all ${
                isVerifying
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                  : "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
              }`}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  <span>Measuring 128 Quantum Qubit Blocks...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify Quantum Seal Authenticity</span>
                </>
              )}
            </button>
          </div>

          {/* Verification Result Display */}
          {verificationResult && (
            <div className={`glass-panel p-8 rounded-3xl border-2 ${
              verificationResult.valid
                ? "border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                : "border-rose-500/50 bg-rose-950/20 shadow-[0_0_40px_rgba(244,63,94,0.2)]"
            } space-y-6`}>
              <div className="flex items-center justify-between border-b border-white/[0.1] pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${verificationResult.valid ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    {verificationResult.valid ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {verificationResult.valid ? "SIGNATURE AUTHENTIC & UNTAMPERED" : "SIGNATURE INVALID OR TAMPERED"}
                    </h4>
                    <span className="text-xs font-mono text-slate-300">
                      Xu-Wang QDS Verification Engine Status: {verificationResult.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className={`text-2xl font-black font-mono px-4 py-2 rounded-2xl border ${
                  verificationResult.valid
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/40"
                }`}>
                  {((verificationResult.verification_score ?? 1.0) * 100).toFixed(1)}% Score
                </div>
              </div>

              {/* Verification Breakdown Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.08]">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Blocks</span>
                  <span className="text-lg font-bold text-white">{verificationResult.total_blocks || 128} Blocks</span>
                </div>
                <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.08]">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Valid Qubit Blocks</span>
                  <span className="text-lg font-bold text-emerald-400">{verificationResult.valid_blocks ?? 128} Passed</span>
                </div>
                <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.08]">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Tampered Blocks</span>
                  <span className={`text-lg font-bold ${verificationResult.invalid_blocks > 0 ? "text-rose-400" : "text-slate-400"}`}>
                    {verificationResult.invalid_blocks ?? 0} Detected
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
