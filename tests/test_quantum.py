from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from quantum.bell_states import create_bell_pair
from quantum.states import (
    prepare_zero_state,
    prepare_one_state,
    prepare_plus_state,
    prepare_minus_state,
)

def test_bell_state():
    circuit = create_bell_pair()

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
def test_create_bell_pair():
    circuit = create_bell_pair()

    assert circuit.num_qubits == 2
    assert circuit.num_clbits == 0