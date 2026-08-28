from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

from quantum.measurements import apply_projective_measurement


SUPPORTED_STATES = {"zero", "one", "plus", "minus"}
SUPPORTED_BASES = {"X", "Y", "Z"}


def _prepare_input_state(
    circuit: QuantumCircuit,
    input_state: str,
) -> None:
    """Prepare Alice's input state on qubit 0."""

    if input_state == "zero":
        return

    if input_state == "one":
        circuit.x(0)
        return

    if input_state == "plus":
        circuit.h(0)
        return

    if input_state == "minus":
        circuit.x(0)
        circuit.h(0)
        return

    raise ValueError(
        f"Unsupported input state: {input_state}. "
        f"Choose from {sorted(SUPPORTED_STATES)}."
    )


def create_teleportation_circuit(
    input_state: str = "plus",
    measurement_basis: str | None = None,
) -> QuantumCircuit:
    """
    Create a 3-qubit quantum teleportation circuit.

    Qubit 0: Alice's input state
    Qubit 1: Alice's half of the Bell pair
    Qubit 2: Bob's half of the Bell pair

    If measurement_basis is provided, Bob's qubit is
    measured in the requested Pauli basis.
    """

    if input_state not in SUPPORTED_STATES:
        raise ValueError(
            f"Unsupported input state: {input_state}. "
            f"Choose from {sorted(SUPPORTED_STATES)}."
        )

    if measurement_basis is not None:
        measurement_basis = measurement_basis.upper()

        if measurement_basis not in SUPPORTED_BASES:
            raise ValueError(
                f"Unsupported measurement basis: {measurement_basis}. "
                f"Choose from {sorted(SUPPORTED_BASES)}."
            )

    # Two classical bits for Alice's Bell measurement.
    # One additional classical bit for Bob's measurement
    # if a basis is requested.
    classical_bits = 3 if measurement_basis else 2

    circuit = QuantumCircuit(3, classical_bits)

    # -------------------------------------------------
    # 1. Prepare Alice's input state
    # -------------------------------------------------

    _prepare_input_state(circuit, input_state)

    # -------------------------------------------------
    # 2. Create Bell pair
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

    with circuit.if_test((circuit.clbits[1], 1)):
        circuit.x(2)

    with circuit.if_test((circuit.clbits[0], 1)):
        circuit.z(2)

    # -------------------------------------------------
    # 5. Optional Bob measurement
    # -------------------------------------------------

    if measurement_basis is not None:
        apply_projective_measurement(
            circuit,
            qubit=2,
            basis=measurement_basis,
        )

        circuit.measure(2, 2)

    return circuit


def run_teleportation(
    input_state: str = "plus",
    shots: int = 1000,
):
    """
    Execute teleportation without measuring Bob's qubit.

    Returns:
        Alice's two-bit Bell-measurement counts.
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


def run_teleportation_with_measurement(
    input_state: str = "plus",
    measurement_basis: str = "Z",
    shots: int = 1000,
):
    """
    Execute teleportation and measure Bob's final qubit
    in a Pauli measurement basis.

    Returns:
        Measurement counts from the complete circuit.
    """

    if shots <= 0:
        raise ValueError("shots must be greater than zero")

    measurement_basis = measurement_basis.upper()

    circuit = create_teleportation_circuit(
        input_state=input_state,
        measurement_basis=measurement_basis,
    )

    simulator = AerSimulator()

    result = simulator.run(
        circuit,
        shots=shots,
    ).result()

    return result.get_counts()