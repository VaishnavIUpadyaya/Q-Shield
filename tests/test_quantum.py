from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from quantum.bell_states import create_bell_pair
from quantum.teleportation import create_teleportation_circuit
from quantum.teleportation import run_teleportation
from quantum.measurements import apply_projective_measurement
from quantum.teleportation import run_teleportation_with_measurement
from quantum.measurements import extract_bob_measurement_counts
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
def test_teleportation_circuit():
    circuit = create_teleportation_circuit("plus")

    assert circuit.num_qubits == 3
    assert circuit.num_clbits == 2

def test_teleportation_execution():
    counts = run_teleportation(
        input_state="plus",
        shots=1000,
    )

    assert sum(counts.values()) == 1000

def test_projective_measurement_bases():
    for basis in ("X", "Y", "Z"):
        circuit = QuantumCircuit(1, 1)

        apply_projective_measurement(
            circuit,
            qubit=0,
            basis=basis,
        )

        circuit.measure(0, 0)

        assert circuit.num_qubits == 1
        assert circuit.num_clbits == 1

def test_teleportation_zero_in_z_basis():
    counts = run_teleportation_with_measurement(
        input_state="zero",
        measurement_basis="Z",
        shots=1000,
    )

    assert sum(counts.values()) == 1000


def test_teleportation_one_in_z_basis():
    counts = run_teleportation_with_measurement(
        input_state="one",
        measurement_basis="Z",
        shots=1000,
    )

    assert sum(counts.values()) == 1000


def test_teleportation_plus_in_x_basis():
    counts = run_teleportation_with_measurement(
        input_state="plus",
        measurement_basis="X",
        shots=1000,
    )

    assert sum(counts.values()) == 1000


def test_teleportation_minus_in_x_basis():
    counts = run_teleportation_with_measurement(
        input_state="minus",
        measurement_basis="X",
        shots=1000,
    )

    assert sum(counts.values()) == 1000

def test_extract_bob_measurement_counts():
    counts = {
        "000": 250,
        "001": 250,
        "010": 250,
        "011": 250,
    }

    bob_counts = extract_bob_measurement_counts(counts)

    assert bob_counts["0"] == 1000
    assert bob_counts["1"] == 0