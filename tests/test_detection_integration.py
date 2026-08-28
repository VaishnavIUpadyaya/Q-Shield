from detection.attacks import flip_binary_outcomes
from detection.detector import detect_binary_anomaly


def test_legitimate_measurements_are_accepted():
    counts = {
        "0": 502,
        "1": 498,
    }

    result = detect_binary_anomaly(
        counts=counts,
        expected_probability=0.5,
    )

    assert result.accepted is True


def test_manipulated_measurements_are_rejected():
    legitimate_counts = {
        "0": 500,
        "1": 500,
    }

    manipulated_counts = flip_binary_outcomes(
        legitimate_counts,
        fraction=0.7,
    )

    result = detect_binary_anomaly(
        counts=manipulated_counts,
        expected_probability=0.5,
    )

    assert result.accepted is False