import logging
from typing import Dict, List, Optional

from experiments.firestore_storage import (
    save_experiment_to_firestore,
)


logger = logging.getLogger(__name__)

_experiment_history: Dict[str, dict] = {}


def save_experiment(experiment: dict) -> dict:
    """
    Save an experiment in memory and attempt Firestore persistence.

    In-memory storage remains available as a fallback when
    Firestore is unavailable.
    """

    if not isinstance(experiment, dict):
        raise ValueError(
            "Experiment must be a dictionary."
        )

    experiment_id = experiment.get("experiment_id")

    if not experiment_id:
        raise ValueError(
            "Experiment must contain 'experiment_id'."
        )

    # Preserve the existing in-memory behavior.
    _experiment_history[experiment_id] = experiment

    # Firestore persistence must not prevent the API from
    # returning a successfully completed experiment.
    try:
        save_experiment_to_firestore(experiment)

    except Exception:
        logger.exception(
            "Unable to persist experiment %s to Firestore. "
            "Using in-memory fallback.",
            experiment_id,
        )

    return experiment


def get_experiment(
    experiment_id: str,
) -> Optional[dict]:
    return _experiment_history.get(experiment_id)


def get_all_experiments() -> List[dict]:
    return list(_experiment_history.values())


def clear_history():
    _experiment_history.clear()