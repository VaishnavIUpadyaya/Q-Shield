from typing import Dict, List, Optional


_experiment_history: Dict[str, dict] = {}


def save_experiment(experiment: dict) -> dict:
    experiment_id = experiment["experiment_id"]

    _experiment_history[experiment_id] = experiment

    return experiment


def get_experiment(experiment_id: str) -> Optional[dict]:
    return _experiment_history.get(experiment_id)


def get_all_experiments() -> List[dict]:
    return list(_experiment_history.values())


def clear_history():
    _experiment_history.clear()