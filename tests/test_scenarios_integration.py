import pytest

from experiments.runner import run_experiment
from experiments.scenarios import ExperimentConfig


SCENARIOS = [
    "none",
    "forgery",
    "replay",
    "impersonation",
    "unauthorized_verification",
    "channel_manipulation",
]


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


@pytest.mark.parametrize(
    "attack_type",
    SCENARIOS,
)
def test_all_scenarios_can_run(
    attack_type,
):

    config = ExperimentConfig(
        attack_type=attack_type,
        shots=100,
        trials=2,
    )

    result = run_experiment(
        config=config,
        protocol_runner=mock_protocol_runner,
        attack_runner=mock_attack_runner,
        detector=mock_detector,
    )

    assert result["attack_type"] == attack_type
    assert result["trials"] == 2
    assert len(result["results"]) == 2