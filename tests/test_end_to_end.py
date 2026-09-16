from experiments.runner import run_experiment
from experiments.scenarios import ExperimentConfig
from experiments.storage import (
    save_experiment,
    load_experiment,
)
from experiments.metrics import summarize_results


def mock_protocol_runner(
    shots,
    seed=None,
):
    """
    Temporary stand-in for P1.

    Produces deterministic mock measurement data.
    """

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
    """
    Temporary stand-in for P3.
    """

    return {
        **protocol_result,
        "attack_type": attack_type,
    }


def mock_detector(result):
    """
    Temporary stand-in for P2.

    This is NOT the real security detector.
    """

    if result["attack_type"] == "none":
        return {
            "decision": "ACCEPT",
            "attack_detected": False,
        }

    return {
        "decision": "REJECT",
        "attack_detected": True,
    }


def test_complete_experiment_pipeline(tmp_path):

    config = ExperimentConfig(
        attack_type="forgery",
        shots=100,
        trials=10,
    )

    # Run experiment
    result = run_experiment(
        config=config,
        protocol_runner=mock_protocol_runner,
        attack_runner=mock_attack_runner,
        detector=mock_detector,
    )

    # Verify number of trials
    assert result["trials"] == 10
    assert len(result["results"]) == 10

    # Calculate summary
    summary = summarize_results(
        result["results"]
    )

    assert summary["total_trials"] == 10
    assert summary["detected"] == 10

    # Save experiment
    file_path = save_experiment(
        result,
        str(tmp_path),
    )

    # Load experiment
    loaded = load_experiment(
        file_path
    )

    # Verify saved data
    assert loaded["trials"] == 10
    assert loaded["shots"] == 100
    assert loaded["attack_type"] == "forgery"

    assert len(
        loaded["results"]
    ) == 10
    