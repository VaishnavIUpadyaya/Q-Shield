from detection.expected import expected_distribution


def test_plus_state_x_basis():
    result = expected_distribution("plus", "X")

    assert result == {
        "0": 1.0,
        "1": 0.0,
    }


def test_plus_state_z_basis():
    result = expected_distribution("plus", "Z")

    assert result == {
        "0": 0.5,
        "1": 0.5,
    }


def test_plus_state_y_basis():
    result = expected_distribution("plus", "Y")

    assert result == {
        "0": 0.5,
        "1": 0.5,
    }


def test_invalid_state_basis():
    try:
        expected_distribution("invalid", "X")
    except ValueError:
        pass
    else:
        raise AssertionError("Expected ValueError")