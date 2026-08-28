from dataclasses import dataclass
from typing import Dict, Any

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


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


def sign(
    message: str,
    signing_state: str = "default",
) -> QDSSignature:

    _validate_message(message)

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
    circuit = QuantumCircuit(2, 2)

    _prepare_signature_state(
        circuit,
        signature_state,
    )

    # Apply public verification information.
    _apply_public_key(
        circuit,
        public_key,
    )

    # Computational-basis measurement.
    circuit.measure(0, 0)
    circuit.measure(1, 1)

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