from experiments.pipeline import execute_experiment
from experiments.scenarios import ExperimentConfig
from experiments.adapters.quantum_adapter import run_p1_protocol
from experiments.adapters.attack_adapter import run_attack
from experiments.adapters.experiment_detector import run_experiment_detector


ATTACK_MAP = {
    "none": "none",
    "forgery": "flip",
    "channel_manipulation": "flip",
    "impersonation": "flip",
    "replay": "none",
    "unauthorized_verification": "none",
}


def run_p4_experiment(
    attack_type: str,
    shots: int,
    trials: int,
    attack_fraction: float,
    save: bool = True,
    save_firestore: bool = False,
):
    if attack_type not in ATTACK_MAP:
        raise ValueError(
            f"Unsupported attack type: {attack_type}"
        )

    p4_attack_type = ATTACK_MAP[attack_type]

    config = ExperimentConfig(
        attack_type=p4_attack_type,
        shots=shots,
        trials=trials,
    )

    def protocol_runner(shots: int, seed=None):
        return run_p1_protocol(
            shots=shots,
            seed=seed,
        )

    def attack_runner(
        protocol_result: dict,
        attack_type: str,
    ):
        return run_attack(
            protocol_result,
            attack_type=attack_type,
            fraction=attack_fraction,
        )

    def detector(attacked_result: dict):
        return run_experiment_detector(
            attacked_result
        )

    result = execute_experiment(
        config=config,
        protocol_runner=protocol_runner,
        attack_runner=attack_runner,
        detector=detector,
        save=save,
        save_firestore=save_firestore,
    )

    # Preserve the original P5 attack name.
    result["attack_type"] = attack_type

    return result