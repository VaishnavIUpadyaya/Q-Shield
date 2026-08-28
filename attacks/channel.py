from copy import deepcopy
from .base import BaseAttack


class ChannelManipulationAttack(BaseAttack):

    SUPPORTED_TYPES = {
        "bit_flip",
        "phase_flip",
        "depolarizing"
    }

    def __init__(
        self,
        manipulation_type="bit_flip",
        probability=0.1
    ):

        if manipulation_type not in self.SUPPORTED_TYPES:
            raise ValueError(
                f"Unsupported manipulation type: "
                f"{manipulation_type}"
            )

        if not 0 <= probability <= 1:
            raise ValueError(
                "probability must be between 0 and 1"
            )

        self.manipulation_type = manipulation_type
        self.probability = probability

    def apply(self, experiment_data: dict) -> dict:

        attacked_data = deepcopy(experiment_data)

        attacked_data["attack_type"] = (
            "channel_manipulation"
        )

        attacked_data["channel_attack"] = {
            "enabled": True,
            "type": self.manipulation_type,
            "probability": self.probability
        }

        attacked_data["attack_metadata"] = {
            "channel_manipulation_type":
                self.manipulation_type,

            "probability":
                self.probability
        }

        return attacked_data