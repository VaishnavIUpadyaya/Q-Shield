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