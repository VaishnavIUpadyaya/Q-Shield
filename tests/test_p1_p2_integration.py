from quantum.teleportation import run_teleportation_with_measurement
from quantum.measurements import extract_bob_measurement_counts

from detection.detector import detect_binary_anomaly
from detection.expected import expected_distribution


def test_p1_to_p2_legitimate_plus_x():

    shots = 1000
    state = "plus"
    basis = "X"

    # P1: execute the real teleportation protocol.
    raw_counts = run_teleportation_with_measurement(
        input_state=state,
        measurement_basis=basis,
        shots=shots,
    )

    # P1 measurement utility: extract Bob's binary result.
    bob_counts = extract_bob_measurement_counts(
        raw_counts
    )

    # P2: obtain the ideal expected distribution.
    expected = expected_distribution(
        state,
        basis,
    )

    expected_probability = expected["0"]

    # P2: perform statistical compatibility detection.
    detection = detect_binary_anomaly(
        counts=bob_counts,
        expected_probability=expected_probability,
        confidence=0.95,
    )

    # Basic integration checks.
    assert sum(bob_counts.values()) == shots

    assert detection.accepted is True

    assert detection.expected_probability == 1.0

    assert 0.0 <= detection.observed_probability <= 1.0

    assert 0.0 <= detection.interval[0] <= 1.0
    assert 0.0 <= detection.interval[1] <= 1.0