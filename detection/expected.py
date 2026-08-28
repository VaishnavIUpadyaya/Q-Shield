"""Expected measurement distributions for supported qubit states."""

from __future__ import annotations

from typing import Mapping


EXPECTED_DISTRIBUTIONS: dict[str, dict[str, float]] = {
    "zero_Z": {
        "0": 1.0,
        "1": 0.0,
    },
    "one_Z": {
        "0": 0.0,
        "1": 1.0,
    },
    "plus_X": {
        "0": 1.0,
        "1": 0.0,
    },
    "minus_X": {
        "0": 0.0,
        "1": 1.0,
    },
    "plus_Z": {
        "0": 0.5,
        "1": 0.5,
    },
    "minus_Z": {
        "0": 0.5,
        "1": 0.5,
    },
    "plus_Y": {
        "0": 0.5,
        "1": 0.5,
    },
    "minus_Y": {
        "0": 0.5,
        "1": 0.5,
    },
}


def expected_distribution(
    state: str,
    basis: str,
) -> Mapping[str, float]:
    """Return the ideal measurement distribution.

    Parameters
    ----------
    state:
        Supported state: zero, one, plus, or minus.

    basis:
        Measurement basis: X, Y, or Z.

    Returns
    -------
    Mapping[str, float]
        Ideal probability distribution for outcomes 0 and 1.
    """

    state = state.lower()
    basis = basis.upper()

    key = f"{state}_{basis}"

    try:
        return EXPECTED_DISTRIBUTIONS[key].copy()
    except KeyError as exc:
        raise ValueError(
            f"Unsupported state/basis combination: "
            f"state={state!r}, basis={basis!r}"
        ) from exc