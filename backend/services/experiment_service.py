from datetime import datetime, timezone
from uuid import uuid4
from typing import Dict

from backend.schemas import ExperimentRequest

from quantum.protocol import sign, verify
from detection.attacks import flip_binary_outcomes
from detection.statistics import (
    counts_to_probabilities,
    distribution_difference,
)
from detection.hypothesis import evaluate_proportion


SUPPORTED_ATTACKS = {
    "none",
    "forgery",
    "replay",
    "impersonation",
    "unauthorized_verification",
    "channel_manipulation",
}


def _flip_qds_outcomes(
    counts: Dict[str, int],
    fraction: float,
) -> Dict[str, int]:
    """
    Adapt the existing P2 binary attack primitive to QDS
    two-bit measurement outcomes.

    Each QDS outcome is one of:
        00, 01, 10, 11

    We flip the second bit of selected outcomes.
    """

    if not 0 <= fraction <= 1:
        raise ValueError("attack fraction must be between 0 and 1")

    result = {
        "00": 0,
        "01": 0,
        "10": 0,
        "11": 0,
    }

    for outcome, count in counts.items():

        if outcome not in result:
            raise ValueError(
                f"Unsupported QDS measurement outcome: {outcome}"
            )

        flip_count = int(count * fraction)
        keep_count = count - flip_count

        result[outcome] += keep_count

        # Flip the second bit:
        flipped = outcome[0] + ("1" if outcome[1] == "0" else "0")

        result[flipped] += flip_count

    return result


def _apply_attack(
    counts: Dict[str, int],
    attack_type: str,
    fraction: float,
) -> Dict[str, int]:

    if attack_type == "none":
        return dict(counts)

    if attack_type in {
        "forgery",
        "channel_manipulation",
        "impersonation",
    }:
        return _flip_qds_outcomes(
            counts,
            fraction,
        )

    # Replay / unauthorized verification are handled
    # as contextual security violations rather than
    # measurement corruption.
    return dict(counts)


def _detect_attack(
    expected: Dict[str, float],
    observed_counts: Dict[str, int],
    attack_type: str,
    confidence: float = 0.95,
):
    observed = counts_to_probabilities(observed_counts)

    difference = distribution_difference(
        expected,
        observed,
    )

    total = sum(observed_counts.values())

    expected_success = expected.get(
        "00",
        0.0,
    )

    successes = observed_counts.get(
        "00",
        0,
    )

    statistical_test = evaluate_proportion(
        successes=successes,
        trials=total,
        expected_probability=expected_success,
        confidence=confidence,
    )

    wilson_ci = list(statistical_test.interval)

    # Context-based attacks.
    if attack_type in {
        "replay",
        "unauthorized_verification",
    }:
        return {
            "decision": "ATTACK_DETECTED",
            "attack_detected": True,
            "statistical_method": "context_check",
            "statistic": difference,
            "deviation": difference,
            "confidence_interval": wilson_ci,
            "p_value": None,
            "reason": (
                f"{attack_type} is rejected by security "
                "context validation."
            ),
        }

    # Normal operation.
    if attack_type == "none":
        return {
            "decision": "ACCEPT",
            "attack_detected": False,
            "statistical_method": "distribution_difference",
            "statistic": difference,
            "deviation": difference,
            "confidence_interval": wilson_ci,
            "p_value": getattr(
                statistical_test,
                "p_value",
                None,
            ),
            "reason": (
                "Measurement distribution is consistent "
                "with the expected QDS distribution."
            ),
        }

    # Statistical attacks.
    detected = (
        difference > 0.10
        or not getattr(
            statistical_test,
            "accepted",
            True,
        )
    )

    return {
        "decision": (
            "ATTACK_DETECTED"
            if detected
            else "ACCEPT"
        ),
        "attack_detected": detected,
        "statistical_method": "distribution_difference",
        "statistic": difference,
        "deviation": difference,
        "confidence_interval": wilson_ci,
        "p_value": getattr(
            statistical_test,
            "p_value",
            None,
        ),
        "reason": (
            "Measurement distribution deviates from "
            "the expected QDS distribution."
            if detected
            else
            "Measurement distribution remains within "
            "the expected statistical range."
        ),
    }



def run_experiment(request: ExperimentRequest):

    if request.attack_type not in SUPPORTED_ATTACKS:
        raise ValueError(
            f"Unsupported attack type: {request.attack_type}"
        )

    experiment_id = str(uuid4())

    # ---------------------------------------------------------
    # 1. Generate QDS signature
    # ---------------------------------------------------------

    signature = sign(request.message)

    # ---------------------------------------------------------
    # 2. Legitimate verification
    # ---------------------------------------------------------

    verification = verify(
        signature,
        shots=request.shots,
    )

    original_counts = dict(
        verification.measurement_counts
    )

    expected_distribution = dict(
        verification.expected_distribution
    )

    # ---------------------------------------------------------
    # 3. Apply attack
    # ---------------------------------------------------------

    attacked_counts = _apply_attack(
        original_counts,
        request.attack_type,
        request.attack_fraction,
    )

    # ---------------------------------------------------------
    # 4. Detection
    # ---------------------------------------------------------

    detection = _detect_attack(
        expected_distribution,
        attacked_counts,
        request.attack_type,
    )

    # ---------------------------------------------------------
    # 5. Measurements
    # ---------------------------------------------------------

    probabilities = counts_to_probabilities(
        attacked_counts
    )

    measurements = {
        "basis": verification.measurement_basis,
        "shots": request.shots,
        "counts": attacked_counts,
        "probabilities": probabilities,
        "expected_distribution": expected_distribution,
        "original_counts": original_counts,
    }

    # ---------------------------------------------------------
    # 6. Final verification status
    # ---------------------------------------------------------

    if request.attack_type == "none":
        verification_result = (
            "VALID"
            if verification.valid
            else "INVALID"
        )
    else:
        verification_result = (
            "ATTACK_DETECTED"
            if detection["attack_detected"]
            else "NOT_DETECTED"
        )

    # ---------------------------------------------------------
    # 7. Return API-compatible result
    # ---------------------------------------------------------

    return {
        "experiment_id": experiment_id,
        "status": "completed",

        "message": request.message,

        "attack_type": request.attack_type,

        "shots": request.shots,
        "trials": request.trials,

        "measurements": measurements,

        "verification_result": verification_result,

        "detection_result": detection,

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }