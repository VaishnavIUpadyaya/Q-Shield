from dataclasses import dataclass
from typing import Optional

VALID_ATTACK_TYPES = {
    "none",
    "flip",
    "forgery",
    "replay",
    "impersonation",
    "unauthorized_verification",
    "channel_manipulation",
}
@dataclass
class ExperimentConfig:
    attack_type: str
    shots: int = 1000
    trials: int = 10
    seed: Optional[int] = None

    def validate(self) -> None:
        if self.attack_type not in VALID_ATTACK_TYPES:
            raise ValueError(
                f"Invalid attack type: {self.attack_type}"
            )

        if self.shots <= 0:
            raise ValueError(
                "shots must be greater than 0"
            )

        if self.trials <= 0:
            raise ValueError(
                "trials must be greater than 0"
            )