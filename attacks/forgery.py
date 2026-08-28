from copy import deepcopy
from .base import BaseAttack


class ForgeryAttack(BaseAttack):

    def __init__(self, forged_state="1"):
        self.forged_state = forged_state

    def apply(self, experiment_data: dict) -> dict:

        attacked_data = deepcopy(experiment_data)

        attacked_data["attack_type"] = "forgery"

        attacked_data["signature"]["expected_state"] = self.forged_state

        attacked_data["attack_metadata"] = {
            "original_signature_state":
                experiment_data["signature"]["expected_state"],
            "forged_signature_state":
                self.forged_state
        }

        return attacked_data