from experiments.runner import run_experiment
from experiments.scenarios import ExperimentConfig
from experiments.adapters.quantum_adapter import run_p1_protocol


def mock_attack_runner(
    protocol_result,
    attack_type,
):
    """
    Temporary P3 replacement.

    Does not modify the quantum result yet.
    """
    return {
        **protocol_result,
        "attack_type": attack_type,
    }


def mock_detector(result):
    """
    Temporary P2 replacement.

    This is NOT the real detector.
    """
    return {
        "decision": "ACCEPT",
        "attack_detected": False,
    }


def test_real_p1_with_p4_runner():

    config = ExperimentConfig(
        attack_type="none",
        shots=100,
        trials=3,
    )

    result = run_experiment(
        config=config,
        protocol_runner=run_p1_protocol,
        attack_runner=mock_attack_runner,
        detector=mock_detector,
    )

    assert result["attack_type"] == "none"
    assert result["shots"] == 100
    assert result["trials"] == 3

    assert len(result["results"]) == 3

    for trial in result["results"]:

        protocol_result = trial[
            "protocol_result"
        ]

        assert protocol_result[
            "shots"
        ] == 100

        assert sum(
            protocol_result["counts"].values()
        ) == 100