"""Statistical verification detector for Q-Shield."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from detection.hypothesis import evaluate_proportion
from detection.statistics import counts_to_probabilities


@dataclass(frozen=True)
class DetectionResult:
    """Result of statistical compatibility analysis."""

    accepted: bool
    observed_probability: float
    expected_probability: float
    confidence: float
    interval: tuple[float, float]


def detect_binary_anomaly(
    counts: Mapping[str, int],
    expected_probability: float,
    confidence: float = 0.95,
) -> DetectionResult:
    """Evaluate whether binary measurement counts are compatible
    with an expected legitimate probability.

    The expected probability must come from the protocol model.
    This function does not define an arbitrary attack threshold.
    """

    if set(counts) - {"0", "1"}:
        raise ValueError(
            "Binary detection accepts only '0' and '1' outcomes."
        )

    probabilities = counts_to_probabilities(counts)

    successes = counts.get("0", 0)
    trials = sum(counts.values())

    result = evaluate_proportion(
        successes=successes,
        trials=trials,
        expected_probability=expected_probability,
        confidence=confidence,
    )

    return DetectionResult(
        accepted=result.compatible,
        observed_probability=probabilities.get("0", 0.0),
        expected_probability=expected_probability,
        confidence=confidence,
        interval=result.interval,
    )