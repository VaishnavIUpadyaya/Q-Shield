from experiments.adapters.quantum_adapter import run_p1_protocol
from experiments.adapters.attack_adapter import run_attack
from experiments.adapters.detection_adapter import run_p2_detector


def test_p1_p3_p2_pipeline():

    # P1: generate legitimate quantum measurement data
    protocol_result = run_p1_protocol(
        shots=1000,
        input_state="plus",
        measurement_basis="X",
    )

    # P3: apply controlled outcome-flip attack
    attacked_result = run_attack(
        protocol_result,
        attack_type="flip",
        fraction=0.5,
    )

    # P2: detect the modified distribution
    detection_result = run_p2_detector(
        {
            "counts": protocol_result["counts"],
            "input_state": attacked_result["input_state"],
            "measurement_basis": attacked_result["measurement_basis"],
            "bob_counts": attacked_result["bob_counts"],
        }
    )

    # Basic validation
    assert detection_result["accepted"] is False

    assert 0.0 <= detection_result[
        "observed_probability"
    ] <= 1.0

    assert detection_result[
        "expected_probability"
    ] == 1.0

    assert sum(
        detection_result["bob_counts"].values()
    ) == 1000