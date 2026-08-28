from experiments.adapters.quantum_adapter import run_p1_protocol
from experiments.adapters.attack_adapter import run_attack


def test_p1_p3_attack_pipeline():

    protocol_result = run_p1_protocol(
        shots=1000,
        input_state="plus",
        measurement_basis="X",
    )

    attacked_result = run_attack(
        protocol_result,
        attack_type="flip",
        fraction=0.5,
    )

    assert attacked_result["attack_type"] == "flip"

    assert attacked_result["fraction"] == 0.5

    assert sum(
        attacked_result["bob_counts"].values()
    ) == 1000