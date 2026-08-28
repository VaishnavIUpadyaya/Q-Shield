from qiskit import QuantumCircuit


def create_bell_pair() -> QuantumCircuit:
    """
    Create a 2-qubit Bell state circuit.

    The resulting state is:

        (|00> + |11>) / sqrt(2)

    Returns:
        QuantumCircuit: A 2-qubit circuit containing the Bell state.
    """
    circuit = QuantumCircuit(2)

    circuit.h(0)
    circuit.cx(0, 1)

    return circuit