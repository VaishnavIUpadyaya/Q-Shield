from experiments.validation import validate_experiment_result


def test_valid_experiment_result():

    result = {
        "attack_type": "none",
        "shots": 100,
        "trials": 1,
        "results": [
            {
                "trial": 1,
                "protocol_result": {},
                "attacked_result": {},
                "detection_result": {
                    "accepted": True,
                    "observed_probability": 1.0,
                },
            }
        ],
    }

    validation = validate_experiment_result(result)

    assert validation["valid"] is True
    assert validation["trial_count"] == 1