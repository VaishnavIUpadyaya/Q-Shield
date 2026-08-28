"""Statistical hypothesis-testing utilities for Q-Shield."""

from __future__ import annotations

from dataclasses import dataclass

from detection.statistics import wilson_interval


@dataclass(frozen=True)
class ProportionTestResult:
    """Result of comparing an observed proportion with an expected one."""

    observed: float
    expected: float
    confidence: float
    interval: tuple[float, float]
    compatible: bool


def evaluate_proportion(
    successes: int,
    trials: int,
    expected_probability: float,
    confidence: float = 0.95,
) -> ProportionTestResult:
    """Test whether an observed proportion is compatible with an expected value.

    The expected probability comes from the legitimate protocol model.
    This function does not invent an attack threshold.
    """

    if not 0 <= expected_probability <= 1:
        raise ValueError(
            "expected_probability must be between 0 and 1."
        )

    lower, upper = wilson_interval(
        successes=successes,
        trials=trials,
        confidence=confidence,
    )

    observed = successes / trials

    compatible = lower <= expected_probability <= upper

    return ProportionTestResult(
        observed=observed,
        expected=expected_probability,
        confidence=confidence,
        interval=(lower, upper),
        compatible=compatible,
    )