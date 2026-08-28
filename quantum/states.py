from qiskit import QuantumCircuit


def prepare_zero_state():
    """Prepare |0>."""
    circuit = QuantumCircuit(1)
    return circuit


def prepare_one_state():
    """Prepare |1>."""
    circuit = QuantumCircuit(1)
    circuit.x(0)
    return circuit


def prepare_plus_state():
    """Prepare |+> = (|0> + |1>) / sqrt(2)."""
    circuit = QuantumCircuit(1)
    circuit.h(0)
    return circuit


def prepare_minus_state():
    """Prepare |-> = (|0> - |1>) / sqrt(2)."""
    circuit = QuantumCircuit(1)
    circuit.x(0)
    circuit.h(0)
    return circuit
def apply_state_to_qubit(circuit, state: str, qubit: int = 0):
    """
    Apply a supported single-qubit state preparation
    to an existing circuit.

    Supported states:
        zero  -> |0>
        one   -> |1>
        plus  -> |+>
        minus -> |->

    Args:
        circuit: Qiskit QuantumCircuit.
        state: Name of the state.
        qubit: Target qubit index.

    Returns:
        The modified circuit.
    """

    if state == "zero":
        return circuit

    if state == "one":
        circuit.x(qubit)
        return circuit

    if state == "plus":
        circuit.h(qubit)
        return circuit

    if state == "minus":
        circuit.x(qubit)
        circuit.h(qubit)
        return circuit

    raise ValueError(
        f"Unsupported state: {state}"
    )