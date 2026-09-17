from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
from typing import Dict, Any, List, Optional, Tuple, Union

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

from quantum.document_hasher import (
    hash_and_chunk_document,
    hash_to_2bit_chunks,
    compute_sha256,
)
from detection.statistics import (
    distribution_difference,
    wilson_interval,
)

SUPPORTED_MESSAGES = {"00", "01", "10", "11"}
MEASUREMENT_BASIS = "Z"


# Xu-Wang Table 1.
PUBLIC_KEY_TABLE = {
    "00": {
        "Bell1": ("X", "I"),
        "Bell2": ("X", "X"),
        "Bell3": ("I", "I"),
        "Bell4": ("I", "X"),
    },
    "01": {
        "Bell1": ("I", "X"),
        "Bell2": ("I", "I"),
        "Bell3": ("X", "X"),
        "Bell4": ("X", "I"),
    },
    "10": {
        "Bell1": ("I", "I"),
        "Bell2": ("I", "X"),
        "Bell3": ("X", "I"),
        "Bell4": ("X", "X"),
    },
    "11": {
        "Bell1": ("X", "X"),
        "Bell2": ("X", "I"),
        "Bell3": ("I", "X"),
        "Bell4": ("I", "I"),
    },
}


@dataclass(frozen=True)
class QDSSignature:
    message: str
    signing_state: str
    sender_measurement: str
    public_verification_info: Dict[str, Any]


@dataclass(frozen=True)
class QDSVerificationResult:
    valid: bool
    message: str
    measurement_counts: Dict[str, int]
    measurement_basis: str
    expected_distribution: Dict[str, float]


@dataclass(frozen=True)
class DocumentQDSSignature:
    document_hash: str
    signer_id: str
    total_blocks: int
    signatures: List[QDSSignature]
    public_verification_info: List[Dict[str, Any]]
    quantum_seal: str
    created_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "document_hash": self.document_hash,
            "signer_id": self.signer_id,
            "total_blocks": self.total_blocks,
            "signatures": [
                {
                    "message": s.message,
                    "signing_state": s.signing_state,
                    "sender_measurement": s.sender_measurement,
                    "public_verification_info": s.public_verification_info,
                }
                for s in self.signatures
            ],
            "public_verification_info": self.public_verification_info,
            "quantum_seal": self.quantum_seal,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DocumentQDSSignature":
        signatures = [
            QDSSignature(
                message=s["message"],
                signing_state=s["signing_state"],
                sender_measurement=s["sender_measurement"],
                public_verification_info=s["public_verification_info"],
            )
            for s in data["signatures"]
        ]
        return cls(
            document_hash=data["document_hash"],
            signer_id=data.get("signer_id", "Alice"),
            total_blocks=data.get("total_blocks", len(signatures)),
            signatures=signatures,
            public_verification_info=data.get(
                "public_verification_info",
                [s.public_verification_info for s in signatures],
            ),
            quantum_seal=data.get("quantum_seal", ""),
            created_at=data.get("created_at", ""),
        )


QuantumSeal = DocumentQDSSignature


@dataclass(frozen=True)
class DocumentVerificationResult:
    valid: bool
    verification_score: float
    document_hash: str
    total_blocks: int
    valid_blocks: int
    invalid_blocks: int
    tampered: bool
    signer_id: Optional[str] = None
    block_results: Optional[List[Dict[str, Any]]] = None
    details: Optional[Dict[str, Any]] = None
    telemetry: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "valid": self.valid,
            "verification_score": self.verification_score,
            "document_hash": self.document_hash,
            "total_blocks": self.total_blocks,
            "valid_blocks": self.valid_blocks,
            "invalid_blocks": self.invalid_blocks,
            "tampered": self.tampered,
            "signer_id": self.signer_id,
            "block_results": self.block_results or [],
            "details": self.details or {},
            "telemetry": self.telemetry or {},
        }

def _validate_message(message: str):
    if message not in SUPPORTED_MESSAGES:
        raise ValueError(
            f"Unsupported message: {message}"
        )


def _bell_name(bits: str) -> str:
    return {
        "00": "Bell1",
        "01": "Bell2",
        "10": "Bell3",
        "11": "Bell4",
    }[bits]


def _signature_state(message: str, bell: str) -> str:
    """
    Computational-basis signature state corresponding
    to the Xu-Wang Table-1 public-key transformation.
    """

    public_key = PUBLIC_KEY_TABLE[message][bell]
    bits = list(message)

    for i, operation in enumerate(public_key):
        if operation == "X":
            bits[i] = str(1 - int(bits[i]))

    return "".join(bits)


def _apply_public_key(
    circuit: QuantumCircuit,
    public_key,
):
    if public_key[0] == "X":
        circuit.x(0)
    elif public_key[0] == "Z":
        circuit.z(0)

    if public_key[1] == "X":
        circuit.x(1)
    elif public_key[1] == "Z":
        circuit.z(1)


def _prepare_signature_state(
    circuit: QuantumCircuit,
    state: str,
):
    if state[0] == "1":
        circuit.x(0)

    if state[1] == "1":
        circuit.x(1)


def _create_signing_circuit() -> QuantumCircuit:
    """
    Six-qubit three-party QDS setup.

    0 = A0
    1 = A1
    2 = B0
    3 = B1
    4 = C0
    5 = C1
    """

    circuit = QuantumCircuit(6, 2)

    # First GHZ state: A0, B0, C0
    circuit.h(0)
    circuit.cx(0, 2)
    circuit.cx(0, 4)

    # Second GHZ state: A1, B1, C1
    circuit.h(1)
    circuit.cx(1, 3)
    circuit.cx(1, 5)

    return circuit


def _build_signing_circuit_for_message(message: str) -> QuantumCircuit:
    circuit = _create_signing_circuit()

    # Table-1 private keys:
    private_keys = {
        "00": "iY",
        "01": "I",
        "10": "X",
        "11": "Z",
    }

    key = private_keys[message]

    if key == "iY":
        circuit.x(0)
        circuit.z(0)
    elif key == "X":
        circuit.x(0)
    elif key == "Z":
        circuit.z(0)

    # Alice's signing operations.
    circuit.h(0)
    circuit.cx(0, 1)
    circuit.h(0)

    circuit.measure(0, 0)
    circuit.measure(1, 1)

    return circuit


def _build_verification_circuit(
    signature_state: str,
    public_key: Tuple[str, str],
) -> QuantumCircuit:
    circuit = QuantumCircuit(2, 2)
    _prepare_signature_state(circuit, signature_state)
    _apply_public_key(circuit, public_key)
    circuit.measure(0, 0)
    circuit.measure(1, 1)
    return circuit


def sign(
    message: str,
    signing_state: str = "default",
) -> QDSSignature:

    _validate_message(message)

    circuit = _build_signing_circuit_for_message(message)

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=1,
    ).result()

    raw_counts = result.get_counts()
    outcome = next(iter(raw_counts))

    sender_measurement = outcome[-2:][::-1]
    bell = _bell_name(sender_measurement)

    public_key = PUBLIC_KEY_TABLE[message][bell]

    signature_state = _signature_state(
        message,
        bell,
    )

    return QDSSignature(
        message=message,
        signing_state=signature_state,
        sender_measurement=sender_measurement,
        public_verification_info={
            "bell_state": bell,
            "public_key": public_key,
            "signature_state": signature_state,
        },
    )


def verify(
    signature: QDSSignature,
    shots: int = 1000,
) -> QDSVerificationResult:

    _validate_message(signature.message)

    if shots <= 0:
        raise ValueError(
            "shots must be greater than zero"
        )

    info = signature.public_verification_info

    public_key = tuple(info["public_key"])
    signature_state = info["signature_state"]

    # Bob's two-qubit verification circuit.
    circuit = _build_verification_circuit(signature_state, public_key)

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=shots,
    ).result()

    raw_counts = result.get_counts()

    measurement_counts = {
        "00": 0,
        "01": 0,
        "10": 0,
        "11": 0,
    }

    for bitstring, count in raw_counts.items():
        # Qiskit displays classical bits in reverse order.
        normalized_bitstring = bitstring[::-1]
        measurement_counts[normalized_bitstring] += count

    expected_distribution = {
        "00": 0.0,
        "01": 0.0,
        "10": 0.0,
        "11": 0.0,
    }

    expected_distribution[signature.message] = 1.0

    valid = (
        measurement_counts[signature.message]
        == shots
    )

    return QDSVerificationResult(
        valid=valid,
        message=signature.message,
        measurement_counts=measurement_counts,
        measurement_basis=MEASUREMENT_BASIS,
        expected_distribution=expected_distribution,
    )


def sign_document_payload(
    file_bytes: Union[bytes, bytearray, str],
    signer_id: str = "Alice",
) -> DocumentQDSSignature:
    """
    Sign a document payload using Xu-Wang QDS multi-block mapping.

    1. Computes SHA-256 digest of document.
    2. Partitions digest into 128 2-bit quantum blocks.
    3. Signs each 2-bit chunk with Table 1 private keys.
    4. Generates a verifiable Quantum Seal.
    """
    doc_hash, chunks = hash_and_chunk_document(file_bytes)

    circuits = [_build_signing_circuit_for_message(chunk) for chunk in chunks]

    simulator = AerSimulator()
    job = simulator.run(circuits, shots=1)
    result = job.result()
    raw_counts_list = result.get_counts()

    if isinstance(raw_counts_list, dict):
        raw_counts_list = [raw_counts_list]

    signatures: List[QDSSignature] = []
    public_verification_info: List[Dict[str, Any]] = []

    for i, chunk in enumerate(chunks):
        raw_counts = raw_counts_list[i]
        outcome = next(iter(raw_counts))

        sender_measurement = outcome[-2:][::-1]
        bell = _bell_name(sender_measurement)
        public_key = PUBLIC_KEY_TABLE[chunk][bell]
        signature_state = _signature_state(chunk, bell)

        sig = QDSSignature(
            message=chunk,
            signing_state=signature_state,
            sender_measurement=sender_measurement,
            public_verification_info={
                "bell_state": bell,
                "public_key": public_key,
                "signature_state": signature_state,
            },
        )
        signatures.append(sig)
        public_verification_info.append(sig.public_verification_info)

    timestamp = datetime.now(timezone.utc).isoformat()
    seal_digest = hashlib.sha256(
        f"{doc_hash}:{signer_id}:{timestamp}:{':'.join(s.sender_measurement for s in signatures)}".encode("utf-8")
    ).hexdigest()

    return DocumentQDSSignature(
        document_hash=doc_hash,
        signer_id=signer_id,
        total_blocks=len(chunks),
        signatures=signatures,
        public_verification_info=public_verification_info,
        quantum_seal=seal_digest,
        created_at=timestamp,
    )


def verify_document_payload(
    document_hash: Union[str, bytes, bytearray],
    quantum_signature: Union[DocumentQDSSignature, Dict[str, Any], List[Any]],
    public_key_info: Optional[List[Dict[str, Any]]] = None,
    shots: int = 100,
) -> DocumentVerificationResult:
    """
    Measure and verify all multi-block projections for a document signature.

    Args:
        document_hash: SHA-256 hex digest or raw document content to verify against.
        quantum_signature: DocumentQDSSignature or dict containing signatures/seal.
        public_key_info: Optional list of public key verification dictionaries.
        shots: Number of quantum measurement shots per block (default: 100).

    Returns:
        DocumentVerificationResult detailing valid status, score, block measurements,
        and quantum telemetry including TVD, Wilson confidence interval, and
        Z⊗Z Pauli projection correlation.
    """
    if shots <= 0:
        raise ValueError("shots must be greater than zero")

    # ---------------------------------------------------------
    # Determine document hash and expected 2-bit chunks
    # ---------------------------------------------------------
    if isinstance(document_hash, (bytes, bytearray)):
        if len(document_hash) == 32:
            doc_hex = document_hash.hex()
            expected_chunks = hash_to_2bit_chunks(document_hash)
        else:
            doc_hex = compute_sha256(document_hash)
            expected_chunks = hash_to_2bit_chunks(doc_hex)

    elif isinstance(document_hash, str):
        clean = document_hash.strip()

        if len(clean) == 64 and all(
            c in "0123456789abcdefABCDEF"
            for c in clean
        ):
            doc_hex = clean.lower()
            expected_chunks = hash_to_2bit_chunks(doc_hex)
        else:
            doc_hex = compute_sha256(clean)
            expected_chunks = hash_to_2bit_chunks(doc_hex)

    else:
        raise TypeError(
            f"Unsupported type for document_hash: {type(document_hash)}"
        )

    # ---------------------------------------------------------
    # Extract block signatures and metadata
    # ---------------------------------------------------------
    sig_doc_hash: Optional[str] = None
    signer_id: Optional[str] = None
    block_signatures: List[Any] = []
    pub_infos: List[Dict[str, Any]] = []

    if isinstance(quantum_signature, DocumentQDSSignature):
        sig_doc_hash = quantum_signature.document_hash
        signer_id = quantum_signature.signer_id
        block_signatures = list(quantum_signature.signatures)
        pub_infos = list(quantum_signature.public_verification_info)

    elif isinstance(quantum_signature, dict):
        sig_doc_hash = quantum_signature.get("document_hash")
        signer_id = quantum_signature.get("signer_id")
        block_signatures = quantum_signature.get("signatures", [])
        pub_infos = (
            quantum_signature.get("public_verification_info")
            or public_key_info
            or []
        )

    elif isinstance(quantum_signature, list):
        block_signatures = list(quantum_signature)
        pub_infos = list(public_key_info or [])

    else:
        raise TypeError(
            f"Unsupported type for quantum_signature: {type(quantum_signature)}"
        )

    # ---------------------------------------------------------
    # Validate block count
    # ---------------------------------------------------------
    if len(block_signatures) != len(expected_chunks):
        return DocumentVerificationResult(
            valid=False,
            verification_score=0.0,
            document_hash=doc_hex,
            total_blocks=len(expected_chunks),
            valid_blocks=0,
            invalid_blocks=len(expected_chunks),
            tampered=True,
            signer_id=signer_id,
            block_results=[],
            details={
                "error": (
                    f"Block count mismatch: expected "
                    f"{len(expected_chunks)}, got "
                    f"{len(block_signatures)}"
                )
            },
            telemetry={
                "tvd": 1.0,
                "wilson_ci": [0.0, 0.0],
                "pauli_projection_correlations": {
                    "ZZ": 0.0,
                },
            },
        )

    # ---------------------------------------------------------
    # Build Bob's verification circuits
    # ---------------------------------------------------------
    circuits: List[QuantumCircuit] = []

    for i, sig in enumerate(block_signatures):

        if isinstance(sig, QDSSignature):
            info = sig.public_verification_info
            sig_state = info.get(
                "signature_state",
                sig.signing_state,
            )
            pub_key = tuple(info["public_key"])

        elif isinstance(sig, dict):
            info = sig.get(
                "public_verification_info",
                {},
            )
            sig_state = (
                info.get("signature_state")
                or sig.get("signing_state")
            )
            pub_key = tuple(
                info.get("public_key")
                or sig.get(
                    "public_key",
                    ("I", "I"),
                )
            )

        elif i < len(pub_infos):
            info = pub_infos[i]
            sig_state = info["signature_state"]
            pub_key = tuple(info["public_key"])

        else:
            raise ValueError(
                f"Missing verification info for block {i}"
            )

        circuit = _build_verification_circuit(
            sig_state,
            pub_key,
        )

        circuits.append(circuit)

    # ---------------------------------------------------------
    # Run quantum verification
    # ---------------------------------------------------------
    simulator = AerSimulator()

    job = simulator.run(
        circuits,
        shots=shots,
    )

    result = job.result()
    raw_counts_list = result.get_counts()

    if isinstance(raw_counts_list, dict):
        raw_counts_list = [raw_counts_list]

    # ---------------------------------------------------------
    # Aggregate measurements across all blocks
    # ---------------------------------------------------------
    aggregate_expected_counts = {
        "00": 0,
        "01": 0,
        "10": 0,
        "11": 0,
    }

    aggregate_observed_counts = {
        "00": 0,
        "01": 0,
        "10": 0,
        "11": 0,
    }

    block_results: List[Dict[str, Any]] = []
    valid_blocks = 0

    # ---------------------------------------------------------
    # Process every document block
    # ---------------------------------------------------------
    for i, expected_chunk in enumerate(expected_chunks):

        raw_counts = raw_counts_list[i]

        measurement_counts = {
            "00": 0,
            "01": 0,
            "10": 0,
            "11": 0,
        }

        for bitstring, count in raw_counts.items():
            normalized = bitstring[::-1]
            measurement_counts[normalized] += count

        # Expected distribution for this block.
        expected_distribution = {
            "00": 0.0,
            "01": 0.0,
            "10": 0.0,
            "11": 0.0,
        }

        expected_distribution[expected_chunk] = 1.0

        # Convert observed counts into probabilities.
        observed_total = sum(
            measurement_counts.values()
        )

        observed_distribution = {
            outcome: (
                count / observed_total
                if observed_total > 0
                else 0.0
            )
            for outcome, count
            in measurement_counts.items()
        }

        # TVD for this block.
        block_tvd = distribution_difference(
            expected_distribution,
            observed_distribution,
        )

        # A block is valid if every shot matches
        # the expected 2-bit message.
        is_block_valid = (
            measurement_counts[expected_chunk] == shots
        )

        if is_block_valid:
            valid_blocks += 1

        # Aggregate counts for document-level telemetry.
        for outcome in aggregate_observed_counts:
            aggregate_observed_counts[outcome] += (
                measurement_counts[outcome]
            )

        aggregate_expected_counts[expected_chunk] += shots

        # Z⊗Z Pauli correlation:
        #
        # eigenvalue:
        #   |0> -> +1
        #   |1> -> -1
        #
        # Therefore:
        #   00 -> +1
        #   01 -> -1
        #   10 -> -1
        #   11 -> +1
        #
        # This is the actual correlation produced by
        # the existing Z-basis verification measurement.
        zz_numerator = (
            measurement_counts["00"]
            - measurement_counts["01"]
            - measurement_counts["10"]
            + measurement_counts["11"]
        )

        zz_correlation = (
            zz_numerator / shots
            if shots > 0
            else 0.0
        )

        block_results.append({
            "block_index": i,
            "expected_message": expected_chunk,
            "valid": is_block_valid,
            "measurement_counts": measurement_counts,
            "observed_distribution": observed_distribution,
            "tvd": round(block_tvd, 6),
            "pauli_projection_correlations": {
                "ZZ": round(zz_correlation, 6),
            },
        })

    # ---------------------------------------------------------
    # Document-level verification statistics
    # ---------------------------------------------------------
    total_blocks = len(expected_chunks)

    invalid_blocks = (
        total_blocks - valid_blocks
    )

    verification_score = (
        valid_blocks / total_blocks
        if total_blocks > 0
        else 0.0
    )

    # ---------------------------------------------------------
    # Document-level TVD
    # ---------------------------------------------------------
    aggregate_expected_total = sum(
        aggregate_expected_counts.values()
    )

    aggregate_observed_total = sum(
        aggregate_observed_counts.values()
    )

    aggregate_expected_distribution = {
        outcome: (
            count / aggregate_expected_total
            if aggregate_expected_total > 0
            else 0.0
        )
        for outcome, count
        in aggregate_expected_counts.items()
    }

    aggregate_observed_distribution = {
        outcome: (
            count / aggregate_observed_total
            if aggregate_observed_total > 0
            else 0.0
        )
        for outcome, count
        in aggregate_observed_counts.items()
    }

    tvd = distribution_difference(
        aggregate_expected_distribution,
        aggregate_observed_distribution,
    )

    # ---------------------------------------------------------
    # Wilson confidence interval
    #
    # Success = measured expected message.
    # ---------------------------------------------------------
    total_shots = (
        total_blocks * shots
    )

    successful_shots = sum(
    result["measurement_counts"][result["expected_message"]]
    for result in block_results
    )

    wilson_ci = wilson_interval(
        successful_shots,
        total_shots,
        confidence=0.95,
    )

    # ---------------------------------------------------------
    # Aggregate Z⊗Z Pauli projection correlation
    # ---------------------------------------------------------
    zz_numerator = (
        aggregate_observed_counts["00"]
        - aggregate_observed_counts["01"]
        - aggregate_observed_counts["10"]
        + aggregate_observed_counts["11"]
    )

    zz_correlation = (
        zz_numerator / total_shots
        if total_shots > 0
        else 0.0
    )

    # ---------------------------------------------------------
    # Hash verification
    # ---------------------------------------------------------
    hash_matched = (
        sig_doc_hash is None
        or sig_doc_hash.lower() == doc_hex.lower()
    )

    # A document is authentic only when:
    # 1. Every block verifies.
    # 2. The signed document hash matches.
    valid = (
        valid_blocks == total_blocks
        and hash_matched
    )

    tampered = (
        not valid
        or verification_score < 1.0
    )

    # ---------------------------------------------------------
    # Return complete verification result
    # ---------------------------------------------------------
    return DocumentVerificationResult(
        valid=valid,
        verification_score=round(
            verification_score,
            4,
        ),
        document_hash=doc_hex,
        total_blocks=total_blocks,
        valid_blocks=valid_blocks,
        invalid_blocks=invalid_blocks,
        tampered=tampered,
        signer_id=signer_id,
        block_results=block_results,

        details={
            "hash_matched": hash_matched,
            "signed_document_hash": sig_doc_hash,
            "verified_document_hash": doc_hex,
            "expected_distribution": (
                aggregate_expected_distribution
            ),
            "observed_distribution": (
                aggregate_observed_distribution
            ),
        },

        telemetry={
            "tvd": round(tvd, 6),
            "wilson_ci": [
                round(wilson_ci[0], 6),
                round(wilson_ci[1], 6),
            ],
            "wilson_confidence": 0.95,
            "successful_shots": successful_shots,
            "total_shots": total_shots,
            "pauli_projection_correlations": {
                "ZZ": round(
                    zz_correlation,
                    6,
                ),
            },
        },
    )