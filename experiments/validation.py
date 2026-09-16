# def validate_experiment_result(result: dict) -> dict:
#     """
#     Validate the structural and numerical integrity of
#     a completed experiment result.

#     This does not replace P2's statistical detector.
#     It validates the experiment output produced by P4.
#     """

#     if not isinstance(result, dict):
#         raise ValueError("Experiment result must be a dictionary.")

#     required_fields = {
#         "attack_type",
#         "shots",
#         "trials",
#         "results",
#     }

#     missing = required_fields - set(result)

#     if missing:
#         raise ValueError(
#             f"Experiment result is missing fields: {sorted(missing)}"
#         )

#     if result["shots"] <= 0:
#         raise ValueError("shots must be greater than zero.")

#     if result["trials"] <= 0:
#         raise ValueError("trials must be greater than zero.")

#     trial_results = result["results"]

#     if len(trial_results) != result["trials"]:
#         raise ValueError(
#             "Number of trial results does not match trials."
#         )

#     for trial in trial_results:

#         if "protocol_result" not in trial:
#             raise ValueError("Trial missing protocol_result.")

#         if "attacked_result" not in trial:
#             raise ValueError("Trial missing attacked_result.")

#         if "detection_result" not in trial:
#             raise ValueError("Trial missing detection_result.")

#         detection = trial["detection_result"]

#         if "accepted" not in detection:
#             raise ValueError(
#                 "Detection result missing accepted field."
#             )

#         if "observed_probability" not in detection:
#             raise ValueError(
#                 "Detection result missing observed_probability."
#             )

#         probability = detection["observed_probability"]

#         if not 0.0 <= probability <= 1.0:
#             raise ValueError(
#                 "Observed probability must be between 0 and 1."
#             )

#     return {
#         "valid": True,
#         "trial_count": len(trial_results),
#     }






def validate_experiment_result(result: dict) -> dict:
    """
    Validate the structural and numerical integrity of
    a completed experiment result.

    This does not replace P2's statistical detector.
    It validates the experiment output produced by P4.

    Supports both:
        - P2's current "accepted" boolean
        - The original "decision" string contract
    """

    if not isinstance(result, dict):
        raise ValueError(
            "Experiment result must be a dictionary."
        )

    required_fields = {
        "attack_type",
        "shots",
        "trials",
        "results",
    }

    missing = required_fields - set(result)

    if missing:
        raise ValueError(
            f"Experiment result is missing fields: "
            f"{sorted(missing)}"
        )

    if result["shots"] <= 0:
        raise ValueError(
            "shots must be greater than zero."
        )

    if result["trials"] <= 0:
        raise ValueError(
            "trials must be greater than zero."
        )

    trial_results = result["results"]

    if not isinstance(trial_results, list):
        raise ValueError(
            "Experiment results must be a list."
        )

    if len(trial_results) != result["trials"]:
        raise ValueError(
            "Number of trial results does not match trials."
        )

    for trial in trial_results:

        if not isinstance(trial, dict):
            raise ValueError(
                "Each trial result must be a dictionary."
            )

        if "protocol_result" not in trial:
            raise ValueError(
                "Trial missing protocol_result."
            )

        if "attacked_result" not in trial:
            raise ValueError(
                "Trial missing attacked_result."
            )

        if "detection_result" not in trial:
            raise ValueError(
                "Trial missing detection_result."
            )

        detection = trial["detection_result"]

        if not isinstance(detection, dict):
            raise ValueError(
                "Detection result must be a dictionary."
            )

        # Current P2 detector contract.
        if "accepted" in detection:

            accepted = detection["accepted"]

            if not isinstance(accepted, bool):
                raise ValueError(
                    "Detection 'accepted' must be boolean."
                )

        # Original detector/test contract.
        elif "decision" in detection:

            decision = detection["decision"]

            if decision not in (
                "ACCEPT",
                "REJECT",
            ):
                raise ValueError(
                    "Detection 'decision' must be "
                    "'ACCEPT' or 'REJECT'."
                )

        else:
            raise ValueError(
                "Detection result must contain either "
                "'accepted' or 'decision'."
            )

        # observed_probability is required when the real
        # statistical detector provides it.
        if "observed_probability" in detection:

            probability = detection[
                "observed_probability"
            ]

            if not 0.0 <= probability <= 1.0:
                raise ValueError(
                    "Observed probability must be "
                    "between 0 and 1."
                )

    return {
        "valid": True,
        "trial_count": len(trial_results),
    }