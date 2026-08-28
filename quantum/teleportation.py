from qiskit import QuantumCircuit


def create_teleportation_circuit(
    input_state: str = "plus",
) -> QuantumCircuit:
    """
    Create a 3-qubit quantum teleportation circuit.

    Qubit 0: Alice's input state
    Qubit 1: Alice's half of Bell pair
    Qubit 2: Bob's half of Bell pair

    Classical bits:
    bit 0: measurement of Alice's input qubit
    bit 1: measurement of Alice's Bell-pair qubit
    """

    circuit = QuantumCircuit(3, 2)

    # -------------------------------------------------
    # 1. Prepare Alice's input state
    # -------------------------------------------------

    if input_state == "zero":
        pass

    elif input_state == "one":
        circuit.x(0)

    elif input_state == "plus":
        circuit.h(0)

    elif input_state == "minus":
        circuit.x(0)
        circuit.h(0)

    else:
        raise ValueError(
            f"Unsupported input state: {input_state}"
        )

    # -------------------------------------------------
    # 2. Create Bell pair between q1 and q2
    # -------------------------------------------------

    circuit.h(1)
    circuit.cx(1, 2)

    # -------------------------------------------------
    # 3. Alice's Bell-basis measurement
    # -------------------------------------------------

    circuit.cx(0, 1)
    circuit.h(0)

    circuit.measure(0, 0)
    circuit.measure(1, 1)

    # -------------------------------------------------
    # 4. Bob's conditional Pauli corrections
    # -------------------------------------------------

    # If q1 measurement = 1 -> apply X
    with circuit.if_test((circuit.clbits[1], True)):
        circuit.x(2)

    # If q0 measurement = 1 -> apply Z
    with circuit.if_test((circuit.clbits[0], True)):
        circuit.z(2)

    return circuit