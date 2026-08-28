from experiments.metrics import (
    calculate_detection_rate,
    calculate_false_acceptance_rate,
    calculate_false_rejection_rate,
    calculate_accuracy,
)


def test_detection_rate():

    assert calculate_detection_rate(
        90,
        100,
    ) == 0.9


def test_false_acceptance_rate():

    assert calculate_false_acceptance_rate(
        5,
        100,
    ) == 0.05


def test_false_rejection_rate():

    assert calculate_false_rejection_rate(
        2,
        100,
    ) == 0.02


def test_accuracy():

    assert calculate_accuracy(
        95,
        100,
    ) == 0.95

def test_zero_denominator():

    assert calculate_detection_rate(
        0,
        0,
    ) == 0.0

    assert calculate_false_acceptance_rate(
        0,
        0,
    ) == 0.0

    assert calculate_false_rejection_rate(
        0,
        0,
    ) == 0.0

    assert calculate_accuracy(
        0,
        0,
    ) == 0.0

from experiments.metrics import summarize_results


def test_summarize_results():

    results = [
        {
            "detection_result": {
                "decision": "REJECT"
            }
        },
        {
            "detection_result": {
                "decision": "REJECT"
            }
        },
        {
            "detection_result": {
                "decision": "ACCEPT"
            }
        },
        {
            "detection_result": {
                "decision": "ACCEPT"
            }
        },
    ]

    summary = summarize_results(results)

    assert summary["total_trials"] == 4
    assert summary["detected"] == 2
    assert summary["accepted"] == 2
    assert summary["detection_rate"] == 0.5