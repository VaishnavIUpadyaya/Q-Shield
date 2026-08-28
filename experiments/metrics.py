def calculate_detection_rate(
    detected_attacks: int,
    total_attacks: int,
) -> float:
    """
    Fraction of attack attempts that were detected.
    """

    if total_attacks == 0:
        return 0.0

    return detected_attacks / total_attacks


def calculate_false_acceptance_rate(
    false_accepts: int,
    total_attacks: int,
) -> float:
    """
    Fraction of attack attempts incorrectly accepted.
    """

    if total_attacks == 0:
        return 0.0

    return false_accepts / total_attacks


def calculate_false_rejection_rate(
    false_rejects: int,
    total_legitimate: int,
) -> float:
    """
    Fraction of legitimate attempts incorrectly rejected.
    """

    if total_legitimate == 0:
        return 0.0

    return false_rejects / total_legitimate


def calculate_accuracy(
    correct: int,
    total: int,
) -> float:
    """
    Fraction of all decisions that were correct.
    """

    if total == 0:
        return 0.0

    return correct / total


def summarize_results(
    results: list[dict],
) -> dict:
    """
    Produce a basic summary from experiment trial results.

    The actual statistical detection method remains
    the responsibility of the detection module.
    """

    total = len(results)

    detected = 0
    accepted = 0

    for result in results:

        detection_result = result.get(
            "detection_result",
            {},
        )

        decision = detection_result.get(
            "decision"
        )

        if decision == "REJECT":
            detected += 1

        elif decision == "ACCEPT":
            accepted += 1

    return {
        "total_trials": total,
        "detected": detected,
        "accepted": accepted,
        "detection_rate": (
            detected / total
            if total
            else 0.0
        ),
    }