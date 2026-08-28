from quantum.teleportation import (
    run_teleportation_with_measurement,
)


def run_p1_protocol(
    shots: int = 1000,
    seed: int | None = None,
    input_state: str = "plus",
    measurement_basis: str = "Z",
) -> dict:
    """
    Adapter between P4 and P1's teleportation implementation.

    P1 currently returns raw Qiskit measurement counts.
    P4 wraps those counts in a structured protocol result.
    """

    counts = run_teleportation_with_measurement(
        input_state=input_state,
        measurement_basis=measurement_basis,
        shots=shots,
    )

    return {
        "input_state": input_state,
        "measurement_basis": measurement_basis,
        "shots": shots,
        "counts": counts,
    }