from detection.hypothesis import evaluate_proportion


def test_legitimate_proportion_is_compatible():
    result = evaluate_proportion(
        successes=502,
        trials=1000,
        expected_probability=0.5,
        confidence=0.95,
    )

    assert result.compatible is True


def test_large_deviation_is_incompatible():
    result = evaluate_proportion(
        successes=850,
        trials=1000,
        expected_probability=0.5,
        confidence=0.95,
    )

    assert result.compatible is False


def test_result_contains_interval():
    result = evaluate_proportion(
        successes=502,
        trials=1000,
        expected_probability=0.5,
    )

    lower, upper = result.interval

    assert lower < result.observed < upper