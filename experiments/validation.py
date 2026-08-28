def validate_experiment_result(result: dict) -> dict:
    """
    Validate the structural and numerical integrity of
    a completed experiment result.

    This does not replace P2's statistical detector.
    It validates the experiment output produced by P4.
    """

    if not isinstance(result, dict):
        raise ValueError("Experiment result must be a dictionary.")

    required_fields = {
        "attack_type",
        "shots",
        "trials",
        "results",
    }

    missing = required_fields - set(result)

    if missing:
        raise ValueError(
            f"Experiment result is missing fields: {sorted(missing)}"
        )

    if result["shots"] <= 0:
        raise ValueError("shots must be greater than zero.")

    if result["trials"] <= 0:
        raise ValueError("trials must be greater than zero.")

    trial_results = result["results"]

    if len(trial_results) != result["trials"]:
        raise ValueError(
            "Number of trial results does not match trials."
        )

    for trial in trial_results:

        if "protocol_result" not in trial:
            raise ValueError("Trial missing protocol_result.")

        if "attacked_result" not in trial:
            raise ValueError("Trial missing attacked_result.")

        if "detection_result" not in trial:
            raise ValueError("Trial missing detection_result.")

        detection = trial["detection_result"]

        if "accepted" not in detection:
            raise ValueError(
                "Detection result missing accepted field."
            )

        if "observed_probability" not in detection:
            raise ValueError(
                "Detection result missing observed_probability."
            )

        probability = detection["observed_probability"]

        if not 0.0 <= probability <= 1.0:
            raise ValueError(
                "Observed probability must be between 0 and 1."
            )

    return {
        "valid": True,
        "trial_count": len(trial_results),
    }