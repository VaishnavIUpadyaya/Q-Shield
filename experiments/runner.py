from typing import Callable

from .scenarios import ExperimentConfig


def run_experiment(
    config: ExperimentConfig,
    protocol_runner: Callable[..., dict],
    attack_runner: Callable[..., dict],
    detector: Callable[..., dict],
) -> dict:
    """
    Execute a complete experiment consisting of multiple trials.

    Parameters
    ----------
    config:
        Experiment configuration.

    protocol_runner:
        Function supplied by P1 that executes the quantum protocol.

    attack_runner:
        Function supplied by P3 that applies the selected attack.

    detector:
        Function supplied by P2 that performs verification/detection.

    Returns
    -------
    dict
        Complete experiment result containing all trial results.
    """

    config.validate()

    trial_results = []

    for trial_number in range(1, config.trials + 1):

        # P1: execute the quantum protocol
        protocol_result = protocol_runner(
            shots=config.shots,
            seed=config.seed,
        )

        # P3: apply the selected attack
        attacked_result = attack_runner(
            protocol_result,
            attack_type=config.attack_type,
        )

        # P2: perform detection/verification
        detection_result = detector(
            attacked_result
        )

        trial_result = {
            "trial": trial_number,
            "attack_type": config.attack_type,
            "shots": config.shots,
            "protocol_result": protocol_result,
            "attacked_result": attacked_result,
            "detection_result": detection_result,
        }

        trial_results.append(trial_result)

    return {
        "attack_type": config.attack_type,
        "shots": config.shots,
        "trials": config.trials,
        "results": trial_results,
    }