from copy import deepcopy
from .base import BaseAttack


class ImpersonationAttack(BaseAttack):

    def __init__(self, attacker_id="mallory"):
        self.attacker_id = attacker_id

    def apply(self, experiment_data: dict) -> dict:

        attacked_data = deepcopy(experiment_data)

        attacked_data["attack_type"] = "impersonation"

        attacked_data["claimed_sender_id"] = attacked_data.get(
            "sender_id"
        )

        attacked_data["actual_sender_id"] = self.attacker_id

        attacked_data["attack_metadata"] = {
            "claimed_identity":
                attacked_data["claimed_sender_id"],

            "actual_identity":
                self.attacker_id
        }

        return attacked_data