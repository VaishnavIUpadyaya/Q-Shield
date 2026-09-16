from experiments.pipeline import execute_experiment
from experiments.scenarios import ExperimentConfig

from experiments.adapters.quantum_adapter import run_p1_protocol
from experiments.adapters.attack_adapter import run_attack
from experiments.adapters.detection_adapter import run_p2_detector


def detector_adapter(attacked_result):
    return run_p2_detector(attacked_result)


config = ExperimentConfig(
    attack_type="flip",
    shots=1000,
    trials=3,
)


result = execute_experiment(
    config=config,
    protocol_runner=run_p1_protocol,
    attack_runner=run_attack,
    detector=detector_adapter,
    save=True,
    save_firestore=True,
)


print("\n=== Q-SHIELD EXPERIMENT ===")
print(f"Experiment ID : {result.get('experiment_id')}")
print(f"Attack type   : {result['attack_type']}")
print(f"Shots         : {result['shots']}")
print(f"Trials        : {result['trials']}")

print("\n=== VALIDATION ===")
print(result["validation"])

print("\n=== METRICS ===")
print(result["metrics"])

print("\n=== STORAGE ===")
print(f"Local JSON     : {result.get('storage_path')}")
print(
    f"Firestore      : "
    f"{result.get('firestore_document_id')}"
)