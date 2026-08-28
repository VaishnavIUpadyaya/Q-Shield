"""Controlled attack-data generators for Q-Shield experiments."""

from __future__ import annotations

from typing import Mapping


def flip_binary_outcomes(
    counts: Mapping[str, int],
    fraction: float,
) -> dict[str, int]:
    """Simulate a binary outcome-flip attack.

    A fraction of the observed 0 outcomes is changed to 1 and the same
    number of 1 outcomes is not changed.

    This function generates controlled experimental data only. It does
    not claim to represent a particular physical attack channel.
    """

    if set(counts) - {"0", "1"}:
        raise ValueError(
            "Binary attack simulation accepts only '0' and '1'."
        )

    if any(count < 0 for count in counts.values()):
        raise ValueError(
            "Measurement counts cannot be negative."
        )

    if not 0 <= fraction <= 1:
        raise ValueError(
            "fraction must be between 0 and 1."
        )

    zero_count = counts.get("0", 0)
    one_count = counts.get("1", 0)

    flipped = int(zero_count * fraction)

    return {
        "0": zero_count - flipped,
        "1": one_count + flipped,
    }