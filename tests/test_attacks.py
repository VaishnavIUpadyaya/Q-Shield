from detection.attacks import flip_binary_outcomes


def test_no_flip_preserves_counts():
    result = flip_binary_outcomes(
        {"0": 500, "1": 500},
        fraction=0.0,
    )

    assert result == {
        "0": 500,
        "1": 500,
    }


def test_half_flip_changes_distribution():
    result = flip_binary_outcomes(
        {"0": 500, "1": 500},
        fraction=0.5,
    )

    assert result == {
        "0": 250,
        "1": 750,
    }


def test_total_count_is_preserved():
    original = {"0": 500, "1": 500}

    result = flip_binary_outcomes(
        original,
        fraction=0.3,
    )

    assert sum(result.values()) == sum(original.values())
    