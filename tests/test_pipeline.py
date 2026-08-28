from experiments.pipeline import execute_experiment
from experiments.scenarios import ExperimentConfig


def mock_protocol_runner(
    shots,
    seed=None,
):
    return {
        "shots": shots,
        "measurements": {
            "Z": {
                "0": shots // 2,
                "1": shots - shots // 2,
            }
        },
    }


def mock_attack_runner(
    protocol_result,
    attack_type,
):
    return {
        **protocol_result,
        "attack_type": attack_type,
    }


def mock_detector(result):
    return {
        "decision": "ACCEPT",
        "attack_detected": False,
    }


def test_execute_experiment_without_storage():

    config = ExperimentConfig(
        attack_type="none",
        shots=100,
        trials=3,
    )

    result = execute_experiment(
        config=config,
        protocol_runner=mock_protocol_runner,
        attack_runner=mock_attack_runner,
        detector=mock_detector,
        save=False,
    )

    assert result["trials"] == 3
    assert len(result["results"]) == 3

    assert result["validation"]["valid"] is True
    assert result["validation"]["trial_count"] == 3

    assert "metrics" in result
    assert result["metrics"]["total_trials"] == 3