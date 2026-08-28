from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


SUPPORTED_STATES = {"zero", "one", "plus", "minus"}


def create_teleportation_circuit(
    input_state: str = "plus",
) -> QuantumCircuit:
    """
    Create a 3-qubit quantum teleportation circuit.

    Qubit 0: Alice's input state
    Qubit 1: Alice's half of the Bell pair
    Qubit 2: Bob's half of the Bell pair

    Classical bit 0 stores the measurement of q0.
    Classical bit 1 stores the measurement of q1.
    """

    if input_state not in SUPPORTED_STATES:
        raise ValueError(
            f"Unsupported input state: {input_state}. "
            f"Choose from {sorted(SUPPORTED_STATES)}."
        )

    circuit = QuantumCircuit(3, 2)

    # 1. Prepare Alice's input state

    if input_state == "one":
        circuit.x(0)

    elif input_state == "plus":
        circuit.h(0)

    elif input_state == "minus":
        circuit.x(0)
        circuit.h(0)

    # "zero" requires no gate.

    # 2. Create Bell pair

    circuit.h(1)
    circuit.cx(1, 2)

    # 3. Alice's Bell-basis measurement

    circuit.cx(0, 1)
    circuit.h(0)

    circuit.measure(0, 0)
    circuit.measure(1, 1)

    # 4. Bob's conditional Pauli corrections

    # If Alice's q1 measurement is 1 -> X
    with circuit.if_test((circuit.clbits[1], 1)):
        circuit.x(2)

    # If Alice's q0 measurement is 1 -> Z
    with circuit.if_test((circuit.clbits[0], 1)):
        circuit.z(2)

    return circuit


def run_teleportation(
    input_state: str = "plus",
    shots: int = 1000,
):
    """
    Execute the teleportation circuit using Aer.

    Returns:
        Measurement counts from Alice's two classical
        Bell-measurement bits.
    """

    if shots <= 0:
        raise ValueError("shots must be greater than zero")

    circuit = create_teleportation_circuit(input_state)

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=shots,
    ).result()

    return result.get_counts()