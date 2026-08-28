from detection.detector import detect_binary_anomaly


def test_legitimate_distribution_is_accepted():
    result = detect_binary_anomaly(
        counts={"0": 502, "1": 498},
        expected_probability=0.5,
    )

    assert result.accepted is True


def test_strongly_deviant_distribution_is_rejected():
    result = detect_binary_anomaly(
        counts={"0": 850, "1": 150},
        expected_probability=0.5,
    )

    assert result.accepted is False


def test_detector_reports_observed_probability():
    result = detect_binary_anomaly(
        counts={"0": 700, "1": 300},
        expected_probability=0.5,
    )

    assert result.observed_probability == 0.7