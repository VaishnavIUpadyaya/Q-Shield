from .runner import run_experiment
from .validation import validate_experiment_result
from .storage import save_experiment


def execute_experiment(
    config,
    protocol_runner,
    attack_runner,
    detector,
    save=True,
):
    """
    Execute, validate, and optionally persist an experiment.
    """

    result = run_experiment(
        config=config,
        protocol_runner=protocol_runner,
        attack_runner=attack_runner,
        detector=detector,
    )

    validation = validate_experiment_result(result)

    result["validation"] = validation

    if save:
        file_path = save_experiment(result)
        result["storage_path"] = file_path

    return result