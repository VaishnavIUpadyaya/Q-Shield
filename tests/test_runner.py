from experiments.runner import run_experiment
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


def test_runner_creates_correct_number_of_trials():

    config = ExperimentConfig(
        attack_type="none",
        shots=100,
        trials=5,
    )

    result = run_experiment(
        config=config,
        protocol_runner=mock_protocol_runner,
        attack_runner=mock_attack_runner,
        detector=mock_detector,
    )

    assert result["trials"] == 5

    assert len(
        result["results"]
    ) == 5


def test_runner_preserves_shot_count():

    config = ExperimentConfig(
        attack_type="none",
        shots=100,
        trials=3,
    )

    result = run_experiment(
        config=config,
        protocol_runner=mock_protocol_runner,
        attack_runner=mock_attack_runner,
        detector=mock_detector,
    )

    for trial in result["results"]:

        assert trial["shots"] == 100

        assert (
            trial["protocol_result"]["shots"]
            == 100
        )