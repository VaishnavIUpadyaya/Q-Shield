from quantum.measurements import extract_bob_measurement_counts

from detection.detector import detect_binary_anomaly
from detection.expected import expected_distribution


def run_p2_detector(
    protocol_result: dict,
) -> dict:
    """
    P4 adapter for P2's statistical detector.

    Converts P1's raw Qiskit counts into Bob's binary
    measurement counts, obtains the ideal expected
    probability, and calls P2.
    """

    raw_counts = protocol_result["counts"]

    state = protocol_result["input_state"]
    basis = protocol_result["measurement_basis"]

    bob_counts = extract_bob_measurement_counts(
        raw_counts
    )

    expected = expected_distribution(
        state,
        basis,
    )

    detection = detect_binary_anomaly(
        counts=bob_counts,
        expected_probability=expected["0"],
        confidence=0.95,
    )

    return {
        "accepted": detection.accepted,
        "observed_probability": detection.observed_probability,
        "expected_probability": detection.expected_probability,
        "confidence": detection.confidence,
        "interval": list(detection.interval),
        "bob_counts": bob_counts,
    }