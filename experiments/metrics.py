# def calculate_detection_rate(
#     detected_attacks: int,
#     total_attacks: int,
# ) -> float:
#     """
#     Fraction of attack attempts that were detected.
#     """

#     if total_attacks == 0:
#         return 0.0

#     return detected_attacks / total_attacks


# def calculate_false_acceptance_rate(
#     false_accepts: int,
#     total_attacks: int,
# ) -> float:
#     """
#     Fraction of attack attempts incorrectly accepted.
#     """

#     if total_attacks == 0:
#         return 0.0

#     return false_accepts / total_attacks


# def calculate_false_rejection_rate(
#     false_rejects: int,
#     total_legitimate: int,
# ) -> float:
#     """
#     Fraction of legitimate attempts incorrectly rejected.
#     """

#     if total_legitimate == 0:
#         return 0.0

#     return false_rejects / total_legitimate


# def calculate_accuracy(
#     correct: int,
#     total: int,
# ) -> float:
#     """
#     Fraction of all decisions that were correct.
#     """

#     if total == 0:
#         return 0.0

#     return correct / total


# def summarize_results(
#     results: list[dict],
# ) -> dict:
#     """
#     Summarize experiment trial results.

#     A trial is considered detected when an attack is present
#     and the detector rejects it.

#     A legitimate trial is correctly accepted when the attack
#     type is "none" or "legitimate".
#     """

#     total = len(results)

#     detected_attacks = 0
#     false_accepts = 0
#     false_rejects = 0
#     correct = 0

#     total_attacks = 0
#     total_legitimate = 0

#     for result in results:

#         attack_type = result.get(
#             "attack_type",
#             "none",
#         )

#         detection_result = result.get(
#             "detection_result",
#             {},
#         )

#         accepted = detection_result.get(
#             "accepted"
#         )

#         is_legitimate = attack_type in (
#             "none",
#             "legitimate",
#         )

#         if is_legitimate:
#             total_legitimate += 1

#             if accepted is True:
#                 correct += 1

#             elif accepted is False:
#                 false_rejects += 1

#         else:
#             total_attacks += 1

#             if accepted is False:
#                 detected_attacks += 1
#                 correct += 1

#             elif accepted is True:
#                 false_accepts += 1

#     return {
#         "total_trials": total,

#         "total_attacks": total_attacks,
#         "total_legitimate": total_legitimate,

#         "detected_attacks": detected_attacks,
#         "false_accepts": false_accepts,
#         "false_rejects": false_rejects,

#         "detection_rate": calculate_detection_rate(
#             detected_attacks,
#             total_attacks,
#         ),

#         "false_acceptance_rate": calculate_false_acceptance_rate(
#             false_accepts,
#             total_attacks,
#         ),

#         "false_rejection_rate": calculate_false_rejection_rate(
#             false_rejects,
#             total_legitimate,
#         ),

#         "accuracy": calculate_accuracy(
#             correct,
#             total,
#         ),
#     }


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
    Summarize experiment trial results.

    Supports both the original detector contract using
    "decision" ("ACCEPT"/"REJECT") and the current P2
    detector contract using "accepted" (True/False).

    For attack-aware results, detection metrics are calculated
    using the trial's attack_type.
    """

    total = len(results)

    detected_attacks = 0
    false_accepts = 0
    false_rejects = 0
    correct = 0

    total_attacks = 0
    total_legitimate = 0

    # Preserve the original runner/test semantics.
    detected = 0
    accepted = 0

    for result in results:

        detection_result = result.get(
            "detection_result",
            {},
        )

        # Support original "decision" format.
        decision = detection_result.get("decision")

        if decision == "REJECT":
            detected += 1
            accepted_decision = False

        elif decision == "ACCEPT":
            accepted += 1
            accepted_decision = True

        # Support current P2 "accepted" format.
        elif "accepted" in detection_result:
            accepted_decision = detection_result["accepted"]

            if accepted_decision is True:
                accepted += 1

            elif accepted_decision is False:
                detected += 1

        else:
            accepted_decision = None

        attack_type = result.get(
            "attack_type",
            "none",
        )

        is_legitimate = attack_type in (
            "none",
            "legitimate",
        )

        if accepted_decision is None:
            continue

        if is_legitimate:
            total_legitimate += 1

            if accepted_decision:
                correct += 1
            else:
                false_rejects += 1

        else:
            total_attacks += 1

            if not accepted_decision:
                detected_attacks += 1
                correct += 1
            else:
                false_accepts += 1

    return {
        # Original public keys.
        "total_trials": total,
        "detected": detected,
        "accepted": accepted,

        "detection_rate": (
            detected / total
            if total
            else 0.0
        ),

        # Extended attack-aware metrics.
        "total_attacks": total_attacks,
        "total_legitimate": total_legitimate,
        "detected_attacks": detected_attacks,
        "false_accepts": false_accepts,
        "false_rejects": false_rejects,

        "false_acceptance_rate": calculate_false_acceptance_rate(
            false_accepts,
            total_attacks,
        ),

        "false_rejection_rate": calculate_false_rejection_rate(
            false_rejects,
            total_legitimate,
        ),

        "accuracy": calculate_accuracy(
            correct,
            total,
        ),
    }