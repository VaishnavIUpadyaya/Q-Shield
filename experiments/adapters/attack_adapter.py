from detection.attacks import flip_binary_outcomes
from quantum.measurements import extract_bob_measurement_counts


def run_attack(
    protocol_result: dict,
    attack_type: str = "none",
    fraction: float = 0.5,
) -> dict:
    """
    P4 adapter for P3's controlled attack engine.

    Converts P1's raw measurement counts into Bob's binary
    counts, applies the selected P3 attack, and preserves
    the protocol metadata required by P2.
    """

    raw_counts = protocol_result["counts"]

    bob_counts = extract_bob_measurement_counts(
        raw_counts
    )

    if attack_type in ("none", "legitimate"):
        attacked_counts = bob_counts
        applied_fraction = 0.0

    elif attack_type == "flip":
        attacked_counts = flip_binary_outcomes(
            bob_counts,
            fraction=fraction,
        )
        applied_fraction = fraction

    else:
        raise ValueError(
            f"Unsupported attack type: {attack_type}"
        )

    return {
        "input_state": protocol_result["input_state"],
        "measurement_basis": protocol_result["measurement_basis"],
        "shots": protocol_result["shots"],
        "attack_type": attack_type,
        "fraction": applied_fraction,
        "bob_counts": attacked_counts,
    }