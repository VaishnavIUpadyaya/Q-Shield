"""Statistical utilities for Q-Shield threat detection."""

from __future__ import annotations

import math
from typing import Mapping


def counts_to_probabilities(
    counts: Mapping[str, int],
) -> dict[str, float]:
    """Convert measurement counts into probabilities."""

    if not counts:
        raise ValueError("Measurement counts cannot be empty.")

    if any(count < 0 for count in counts.values()):
        raise ValueError("Measurement counts cannot be negative.")

    total = sum(counts.values())

    if total <= 0:
        raise ValueError(
            "Total measurement count must be greater than zero."
        )

    return {
        outcome: count / total
        for outcome, count in counts.items()
    }


def validate_distribution(
    distribution: Mapping[str, float],
    tolerance: float = 1e-9,
) -> bool:
    """Check whether a probability distribution is valid."""

    if tolerance < 0:
        raise ValueError("Tolerance cannot be negative.")

    if not distribution:
        return False

    probabilities = list(distribution.values())

    if any(
        not math.isfinite(probability)
        for probability in probabilities
    ):
        return False

    if any(probability < 0 for probability in probabilities):
        return False

    return math.isclose(
        sum(probabilities),
        1.0,
        abs_tol=tolerance,
    )


def distribution_difference(
    expected: Mapping[str, float],
    observed: Mapping[str, float],
) -> float:
    """Calculate total variation distance between two distributions."""

    if not validate_distribution(expected):
        raise ValueError("Expected distribution is invalid.")

    if not validate_distribution(observed):
        raise ValueError("Observed distribution is invalid.")

    outcomes = set(expected) | set(observed)

    return 0.5 * sum(
        abs(
            expected.get(outcome, 0.0)
            - observed.get(outcome, 0.0)
        )
        for outcome in outcomes
    )


def wilson_interval(
    successes: int,
    trials: int,
    confidence: float = 0.95,
) -> tuple[float, float]:
    """Calculate the Wilson confidence interval for a binomial proportion."""

    if trials <= 0:
        raise ValueError("trials must be greater than zero.")

    if successes < 0 or successes > trials:
        raise ValueError(
            "successes must be between 0 and trials."
        )

    if not 0 < confidence < 1:
        raise ValueError(
            "confidence must be between 0 and 1."
        )

    # Standard normal quantiles for supported confidence levels.
    z_values = {
        0.90: 1.6448536269514722,
        0.95: 1.959963984540054,
        0.99: 2.5758293035489004,
    }

    if confidence not in z_values:
        raise ValueError(
            "Supported confidence levels are 0.90, 0.95, and 0.99."
        )

    z = z_values[confidence]

    p_hat = successes / trials

    denominator = 1 + (z**2 / trials)

    center = (
        p_hat + (z**2 / (2 * trials))
    ) / denominator

    margin = (
        z
        * math.sqrt(
            (p_hat * (1 - p_hat) / trials)
            + (z**2 / (4 * trials**2))
        )
        / denominator
    )

    lower = max(0.0, center - margin)
    upper = min(1.0, center + margin)

    return lower, upper