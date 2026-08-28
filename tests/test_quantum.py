from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from quantum.states import (
    prepare_zero_state,
    prepare_one_state,
    prepare_plus_state,
    prepare_minus_state,
)

def test_bell_state():
    circuit = QuantumCircuit(2)

    # Create Bell state
    circuit.h(0)
    circuit.cx(0, 1)

    # Measure both qubits
    circuit.measure_all()

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=1000
    ).result()

    counts = result.get_counts()

    # Bell state should produce correlated results
    assert "00" in counts
    assert "11" in counts

    # These outcomes should not occur
    assert "01" not in counts
    assert "10" not in counts

def test_zero_state():
    circuit = prepare_zero_state()
    assert circuit.num_qubits == 1


def test_one_state():
    circuit = prepare_one_state()
    assert circuit.num_qubits == 1


def test_plus_state():
    circuit = prepare_plus_state()
    assert circuit.num_qubits == 1


def test_minus_state():
    circuit = prepare_minus_state()
    assert circuit.num_qubits == 1