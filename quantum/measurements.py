from qiskit import QuantumCircuit


SUPPORTED_BASES = {"X", "Y", "Z"}


def apply_projective_measurement(
    circuit: QuantumCircuit,
    qubit: int,
    basis: str,
) -> QuantumCircuit:
    """
    Apply a projective measurement of a qubit
    in the requested Pauli basis.

    Z basis:
        Computational basis {|0>, |1>}

    X basis:
        Eigenbasis of Pauli-X {|+>, |->}

    Y basis:
        Eigenbasis of Pauli-Y {|+i>, |-i>}

    The caller is responsible for providing an
    appropriate classical bit for the measurement.
    """

    basis = basis.upper()

    if basis not in SUPPORTED_BASES:
        raise ValueError(
            f"Unsupported measurement basis: {basis}. "
            f"Choose from {sorted(SUPPORTED_BASES)}."
        )

    if basis == "X":
        # Rotate X eigenbasis into computational basis.
        circuit.h(qubit)

    elif basis == "Y":
        # Rotate Y eigenbasis into computational basis.
        circuit.sdg(qubit)
        circuit.h(qubit)

    # Z requires no basis rotation.

    return circuit

def extract_bob_measurement_counts(counts):
    """
    Extract Bob's final measurement bit from complete
    teleportation measurement counts.

    Qiskit displays classical register bits in reverse
    visual order, so the rightmost bit corresponds to
    classical bit 0.

    Our circuit stores Bob's measurement in classical bit 2,
    which appears as the leftmost bit in the displayed
    three-bit result.

    Example:

        "011" -> Bob = 0
        "100" -> Bob = 1

    Args:
        counts: Dictionary returned by Qiskit get_counts().

    Returns:
        Dictionary with Bob measurement counts.
    """

    bob_counts = {
        "0": 0,
        "1": 0,
    }

    for bitstring, count in counts.items():
        bob_bit = bitstring[0]
        bob_counts[bob_bit] += count

    return bob_counts