import base64
import json
from io import BytesIO
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from quantum.document_hasher import (
    SHA256_BLOCK_COUNT,
    SUPPORTED_CHUNK_VALUES,
    chunks_to_hash,
    compute_sha256,
    compute_sha256_bytes,
    hash_and_chunk_document,
    hash_to_2bit_chunks,
)
from quantum.protocol import (
    DocumentQDSSignature,
    DocumentVerificationResult,
    QDSSignature,
    sign_document_payload,
    verify_document_payload,
)

client = TestClient(app)


# =====================================================================
# 1. Unit Tests for quantum/document_hasher.py
# =====================================================================

class TestDocumentHasher:
    def test_compute_sha256_bytes_and_string(self, tmp_path: Path):
        data = b"Quantum-Shield Multi-Block Test Payload"
        raw_hash = compute_sha256_bytes(data)
        hex_hash = compute_sha256(data)

        assert isinstance(raw_hash, bytes)
        assert len(raw_hash) == 32
        assert isinstance(hex_hash, str)
        assert len(hex_hash) == 64
        assert raw_hash.hex() == hex_hash

        # Test with string
        assert compute_sha256("test document") == compute_sha256(b"test document")

        # Test with file path
        test_file = tmp_path / "sample.pdf"
        test_file.write_bytes(b"%PDF-1.4 sample quantum document content")
        assert compute_sha256(test_file) == compute_sha256(b"%PDF-1.4 sample quantum document content")

    def test_hash_to_2bit_chunks_length_and_values(self):
        sample_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        chunks = hash_to_2bit_chunks(sample_hash)

        assert len(chunks) == SHA256_BLOCK_COUNT
        assert len(chunks) == 128
        for chunk in chunks:
            assert chunk in SUPPORTED_CHUNK_VALUES

        # Test from raw bytes
        chunks_from_bytes = hash_to_2bit_chunks(bytes.fromhex(sample_hash))
        assert chunks_from_bytes == chunks

    def test_chunks_to_hash_roundtrip(self):
        test_hashes = [
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "0000000000000000000000000000000000000000000000000000000000000000",
            "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "a5c3d2e1f0123456789abcdef0123456789abcdef0123456789abcdef0123456",
        ]
        for original_hash in test_hashes:
            chunks = hash_to_2bit_chunks(original_hash)
            reconstructed = chunks_to_hash(chunks)
            assert reconstructed == original_hash

    def test_hash_and_chunk_document(self):
        doc = b"Confidential Medical Record with Quantum Signature"
        doc_hash, chunks = hash_and_chunk_document(doc)

        assert len(doc_hash) == 64
        assert len(chunks) == 128
        assert chunks_to_hash(chunks) == doc_hash

    def test_invalid_hasher_inputs(self):
        with pytest.raises(ValueError):
            hash_to_2bit_chunks("tooshort")

        with pytest.raises(ValueError):
            hash_to_2bit_chunks("z" * 64)  # Invalid hex chars

        with pytest.raises(ValueError):
            hash_to_2bit_chunks(b"short bytes")

        with pytest.raises(TypeError):
            hash_to_2bit_chunks(12345)  # type: ignore

        with pytest.raises(ValueError):
            chunks_to_hash(["00"] * 127)  # Too few chunks

        with pytest.raises(ValueError):
            chunks_to_hash(["00"] * 127 + ["99"])  # Invalid chunk value


# =====================================================================
# 2. Unit Tests for quantum/protocol.py Multi-Block Signing & Verifying
# =====================================================================

class TestMultiBlockQDSProtocol:
    def test_sign_document_payload_structure(self):
        doc = b"Legal Contract #4429 - Signed under Xu-Wang QDS"
        seal = sign_document_payload(doc, signer_id="Alice-Quantum-Signer")

        assert isinstance(seal, DocumentQDSSignature)
        assert seal.signer_id == "Alice-Quantum-Signer"
        assert seal.total_blocks == 128
        assert len(seal.signatures) == 128
        assert len(seal.public_verification_info) == 128
        assert isinstance(seal.quantum_seal, str)
        assert len(seal.quantum_seal) == 64
        assert seal.document_hash == compute_sha256(doc)

        # Each block signature must have valid sender measurement and public key
        for sig in seal.signatures:
            assert isinstance(sig, QDSSignature)
            assert sig.message in SUPPORTED_CHUNK_VALUES
            assert sig.sender_measurement in SUPPORTED_CHUNK_VALUES
            assert "public_key" in sig.public_verification_info

    def test_verify_document_payload_legitimate(self):
        doc = b"Electronic Health Record - Patient 992"
        seal = sign_document_payload(doc, signer_id="Doctor-Bob")

        result = verify_document_payload(
            document_hash=doc,
            quantum_signature=seal,
            shots=50,
        )

        assert isinstance(result, DocumentVerificationResult)
        assert result.valid is True
        assert result.tampered is False
        assert result.verification_score == 1.0
        assert result.total_blocks == 128
        assert result.valid_blocks == 128
        assert result.invalid_blocks == 0
        assert result.document_hash == seal.document_hash
        assert result.signer_id == "Doctor-Bob"

    def test_verify_with_signature_dict_and_public_keys(self):
        doc = b"Corporate Resolution Document"
        seal = sign_document_payload(doc)
        seal_dict = seal.to_dict()

        result = verify_document_payload(
            document_hash=seal.document_hash,
            quantum_signature=seal_dict,
            shots=50,
        )

        assert result.valid is True
        assert result.verification_score == 1.0
        assert result.valid_blocks == 128

    def test_signature_serialization_roundtrip(self):
        doc = b"Patent Application 2026/09"
        seal = sign_document_payload(doc, signer_id="Inventor-Carol")
        seal_dict = seal.to_dict()

        restored_seal = DocumentQDSSignature.from_dict(seal_dict)
        assert restored_seal.document_hash == seal.document_hash
        assert restored_seal.signer_id == seal.signer_id
        assert restored_seal.total_blocks == seal.total_blocks
        assert restored_seal.quantum_seal == seal.quantum_seal
        assert len(restored_seal.signatures) == 128

    def test_verify_rejects_invalid_shots(self):
        doc = b"Test"
        seal = sign_document_payload(doc)
        with pytest.raises(ValueError):
            verify_document_payload(doc, seal, shots=0)


# =====================================================================
# 3. Tamper-Sensitivity Tests (Collapsing Quantum Score on 1-Bit Flip)
# =====================================================================

class TestTamperSensitivity:
    def test_single_bit_flip_collapses_score_on_10mb_document(self):
        """
        Create a 10MB simulated document, flip exactly 1 bit at the middle byte,
        and verify that the avalanche effect completely collapses the quantum
        verification score from 1.0 to ~0.5 and invalidates the signature.
        """
        # Create 10MB deterministic payload
        doc_size = 10 * 1024 * 1024  # 10 MB
        # Use repeating pattern for predictable non-trivial content
        chunk = b"Q-SHIELD-SECURE-DOCUMENT-10MB-PAYLOAD-TEST-OCTET-" * 20  # 1000 bytes
        full_doc = bytearray(chunk * (doc_size // len(chunk)))

        original_hash = compute_sha256(full_doc)

        # Alice signs the original 10MB document
        seal = sign_document_payload(full_doc, signer_id="Alice-Enterprise")
        assert seal.document_hash == original_hash

        # Legitimate verification succeeds with score 1.0
        legit_result = verify_document_payload(
            document_hash=full_doc,
            quantum_signature=seal,
            shots=10,
        )
        assert legit_result.valid is True
        assert legit_result.verification_score == 1.0

        # Tamper: Flip exactly 1 bit in the 10MB document (e.g., bit 0 of byte 5,000,000)
        tampered_doc = bytearray(full_doc)
        tampered_doc[5_000_000] ^= 0b00000001

        tampered_hash = compute_sha256(tampered_doc)
        assert tampered_hash != original_hash

        # Attempt to verify original signature against the tampered 10MB document
        tampered_result = verify_document_payload(
            document_hash=tampered_doc,
            quantum_signature=seal,
            shots=10,
        )

        assert tampered_result.valid is False
        assert tampered_result.tampered is True
        assert tampered_result.valid_blocks < 128
        assert tampered_result.invalid_blocks > 0
        # Due to SHA-256 avalanche effect (~50% bit flip), most blocks fail and score collapses
        assert tampered_result.verification_score < 0.70
        assert tampered_result.invalid_blocks >= 40

    def test_single_byte_flip_on_pdf_bytes(self):
        pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Title (Invoice #1001) /Amount ($50,000.00) >>\nendobj\n%%EOF"
        seal = sign_document_payload(pdf_bytes, signer_id="Finance-Dept")

        # Attacker modifies $50,000.00 to $90,000.00 (1 character changed)
        tampered_pdf = pdf_bytes.replace(b"$50,000.00", b"$90,000.00")

        result = verify_document_payload(
            document_hash=tampered_pdf,
            quantum_signature=seal,
            shots=20,
        )

        assert result.valid is False
        assert result.tampered is True
        assert result.verification_score < 0.75
        assert result.details["hash_matched"] is False

    def test_forged_quantum_signature_block_detected(self):
        doc = b"Top Secret Quantum Protocol Blueprint"
        seal = sign_document_payload(doc)
        seal_dict = seal.to_dict()

        # Adversary modifies block 5's signing_state or public key
        seal_dict["signatures"][5]["public_verification_info"]["signature_state"] = "11"
        seal_dict["signatures"][5]["public_verification_info"]["public_key"] = ("I", "I")

        result = verify_document_payload(
            document_hash=seal.document_hash,
            quantum_signature=seal_dict,
            shots=50,
        )

        assert result.valid is False
        assert result.tampered is True
        assert result.valid_blocks < 128


# =====================================================================
# 4. API Endpoints Integration Tests (POST /documents/...)
# =====================================================================

class TestDocumentEndpoints:
    def test_documents_hash_endpoint(self):
        # Test text
        resp = client.post(
            "/documents/hash",
            data={"document_text": "Sample text for quantum hashing"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_blocks"] == 128
        assert len(data["chunks"]) == 128
        assert len(data["document_hash"]) == 64

        # Test file upload
        file_content = b"PDF mock content binary data"
        resp_file = client.post(
            "/documents/hash",
            files={"file": ("mock.pdf", BytesIO(file_content), "application/pdf")},
        )
        assert resp_file.status_code == 200
        assert resp_file.json()["document_hash"] == compute_sha256(file_content)

    def test_documents_sign_endpoint_json_and_verify(self):
        # 1. Sign via JSON
        sign_resp = client.post(
            "/documents/sign",
            json={
                "document_text": "Quantum Confidential Document #771",
                "signer_id": "Alice-API",
            },
        )
        assert sign_resp.status_code == 200
        sign_data = sign_resp.json()
        assert sign_data["status"] == "signed"
        assert sign_data["signer_id"] == "Alice-API"
        assert sign_data["total_blocks"] == 128
        assert len(sign_data["signatures"]) == 128
        assert "quantum_seal" in sign_data

        # 2. Verify legitimate via JSON
        verify_resp = client.post(
            "/documents/verify",
            json={
                "document_text": "Quantum Confidential Document #771",
                "quantum_signature": sign_data,
                "shots": 50,
            },
        )
        assert verify_resp.status_code == 200
        verify_data = verify_resp.json()
        assert verify_data["valid"] is True
        assert verify_data["tampered"] is False
        assert verify_data["verification_score"] == 1.0
        assert verify_data["status"] == "verified"

        # 3. Verify tampered document via JSON -> score collapses
        tampered_verify = client.post(
            "/documents/verify",
            json={
                "document_text": "Quantum Confidential Document #772",  # 1 char changed
                "quantum_signature": sign_data,
                "shots": 50,
            },
        )
        assert tampered_verify.status_code == 200
        tampered_data = tampered_verify.json()
        assert tampered_data["valid"] is False
        assert tampered_data["tampered"] is True
        assert tampered_data["verification_score"] < 0.75
        assert tampered_data["status"] == "tampered"

    def test_documents_sign_and_verify_file_upload(self):
        pdf_bytes = b"%PDF-1.4 Mock Binary PDF File For Signing"

        # Sign via multipart file upload
        sign_resp = client.post(
            "/documents/sign",
            files={"file": ("contract.pdf", BytesIO(pdf_bytes), "application/pdf")},
            data={"signer_id": "Notary-Officer"},
        )
        assert sign_resp.status_code == 200
        sig_payload = sign_resp.json()
        assert sig_payload["signer_id"] == "Notary-Officer"

        # Verify via multipart file upload
        verify_resp = client.post(
            "/documents/verify",
            files={"file": ("contract.pdf", BytesIO(pdf_bytes), "application/pdf")},
            data={
                "signature_json": json.dumps(sig_payload),
                "shots": "50",
            },
        )
        assert verify_resp.status_code == 200
        v_data = verify_resp.json()
        assert v_data["valid"] is True
        assert v_data["verification_score"] == 1.0

        # Verify tampered file upload
        tampered_bytes = b"%PDF-1.4 Mock Binary PDF File For Tampering!"
        tampered_resp = client.post(
            "/documents/verify",
            files={"file": ("contract.pdf", BytesIO(tampered_bytes), "application/pdf")},
            data={
                "signature_json": json.dumps(sig_payload),
                "shots": "50",
            },
        )
        assert tampered_resp.status_code == 200
        t_data = tampered_resp.json()
        assert t_data["valid"] is False
        assert t_data["tampered"] is True
        assert t_data["status"] == "tampered"

    def test_documents_endpoint_base64_payload(self):
        raw_data = b"Image PNG mock raw byte stream"
        b64_str = base64.b64encode(raw_data).decode("utf-8")

        sign_resp = client.post(
            "/documents/sign",
            json={"document_base64": b64_str, "signer_id": "Image-Signer"},
        )
        assert sign_resp.status_code == 200
        sig_data = sign_resp.json()

        verify_resp = client.post(
            "/documents/verify",
            json={"document_base64": b64_str, "quantum_signature": sig_data},
        )
        assert verify_resp.status_code == 200
        assert verify_resp.json()["valid"] is True

    def test_documents_error_handling(self):
        # Empty signing request
        resp = client.post("/documents/sign", json={})
        assert resp.status_code == 400

        # Empty verification request
        resp2 = client.post("/documents/verify", json={})
        assert resp2.status_code == 400

        # File upload verification missing signature_json
        resp3 = client.post(
            "/documents/verify",
            files={"file": ("doc.txt", BytesIO(b"content"), "text/plain")},
        )
        assert resp3.status_code == 400
