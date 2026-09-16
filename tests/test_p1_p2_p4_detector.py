from experiments.adapters.quantum_adapter import run_p1_protocol
from experiments.adapters.detection_adapter import run_p2_detector


def test_p1_p2_p4_detection_pipeline():

    protocol_result = run_p1_protocol(
        shots=1000,
        input_state="plus",
        measurement_basis="X",
    )

    detection_result = run_p2_detector(
        protocol_result
    )

    assert detection_result["accepted"] is True

    assert detection_result["expected_probability"] == 1.0

    assert 0.0 <= detection_result[
        "observed_probability"
    ] <= 1.0

    assert sum(
        detection_result["bob_counts"].values()
    ) == 1000