from quantum.measurements import extract_bob_measurement_counts

from detection.detector import detect_binary_anomaly
from detection.expected import expected_distribution


def run_p2_detector(
    protocol_result: dict,
) -> dict:
    """
    P4 adapter for P2's statistical detector.

    Accepts either:

    1. A normal P1 protocol result containing raw Qiskit counts.
    2. A P3 attacked result containing Bob's binary counts.
    """

    state = protocol_result["input_state"]
    basis = protocol_result["measurement_basis"]

    # If P3 has already produced attacked Bob counts,
    # use them directly.
    if "bob_counts" in protocol_result:
        bob_counts = protocol_result["bob_counts"]

    # Otherwise extract Bob's counts from the raw P1 result.
    else:
        raw_counts = protocol_result["counts"]

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
        "bob_counts": dict(bob_counts),
    }