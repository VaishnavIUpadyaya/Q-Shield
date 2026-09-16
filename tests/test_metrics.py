from experiments.metrics import summarize_results


def test_legitimate_results_are_accepted():

    results = [
        {
            "attack_type": "none",
            "detection_result": {
                "accepted": True,
            },
        },
        {
            "attack_type": "none",
            "detection_result": {
                "accepted": True,
            },
        },
    ]

    summary = summarize_results(results)

    assert summary["total_trials"] == 2
    assert summary["total_legitimate"] == 2
    assert summary["total_attacks"] == 0
    assert summary["false_rejects"] == 0
    assert summary["accuracy"] == 1.0


def test_detected_attack_is_counted():

    results = [
        {
            "attack_type": "flip",
            "detection_result": {
                "accepted": False,
            },
        },
    ]

    summary = summarize_results(results)

    assert summary["total_attacks"] == 1
    assert summary["detected_attacks"] == 1
    assert summary["detection_rate"] == 1.0
    assert summary["false_accepts"] == 0
    assert summary["accuracy"] == 1.0


def test_false_acceptance_is_counted():

    results = [
        {
            "attack_type": "flip",
            "detection_result": {
                "accepted": True,
            },
        },
    ]

    summary = summarize_results(results)

    assert summary["total_attacks"] == 1
    assert summary["detected_attacks"] == 0
    assert summary["false_accepts"] == 1
    assert summary["false_acceptance_rate"] == 1.0
    assert summary["accuracy"] == 0.0