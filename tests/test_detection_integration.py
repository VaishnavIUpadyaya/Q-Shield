from detection.attacks import flip_binary_outcomes
from detection.detector import detect_binary_anomaly
from quantum.protocol import sign, verify


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

    from quantum.protocol import sign, verify


def test_protocol_output_is_compatible_with_detection_layer():
    signature = sign("00")
    result = verify(signature, shots=1000)

    assert result.message == "00"
    assert result.measurement_basis == "Z"

    assert set(result.measurement_counts) == {
        "00",
        "01",
        "10",
        "11",
    }

    assert set(result.expected_distribution) == {
        "00",
        "01",
        "10",
        "11",
    }

    assert sum(result.measurement_counts.values()) == 1000

    assert result.expected_distribution["00"] == 1.0
    assert sum(result.expected_distribution.values()) == 1.0