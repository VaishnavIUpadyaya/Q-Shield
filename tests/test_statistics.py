from detection.statistics import (
    counts_to_probabilities,
    validate_distribution,
    distribution_difference,
    wilson_interval,
)


def test_counts_to_probabilities():
    result = counts_to_probabilities(
        {"0": 498, "1": 502}
    )

    assert result == {
        "0": 0.498,
        "1": 0.502,
    }


def test_validate_distribution():
    assert validate_distribution(
        {"0": 0.5, "1": 0.5}
    )


def test_distribution_difference():
    result = distribution_difference(
        {"0": 0.5, "1": 0.5},
        {"0": 0.7, "1": 0.3},
    )

    assert abs(result - 0.2) < 1e-12


def test_wilson_interval():
    lower, upper = wilson_interval(
        successes=502,
        trials=1000,
        confidence=0.95,
    )

    assert 0 < lower < 0.502
    assert 0.502 < upper < 1