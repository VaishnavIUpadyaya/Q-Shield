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