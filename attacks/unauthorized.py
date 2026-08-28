from copy import deepcopy
from .base import BaseAttack


class UnauthorizedVerificationAttack(BaseAttack):

    def __init__(self, verifier_id="eve"):
        self.verifier_id = verifier_id

    def apply(self, experiment_data: dict) -> dict:

        attacked_data = deepcopy(experiment_data)

        attacked_data["attack_type"] = (
            "unauthorized_verification"
        )

        attacked_data["requested_verifier"] = self.verifier_id

        attacked_data["attack_metadata"] = {
            "requested_verifier": self.verifier_id,
            "authorized_receiver":
                attacked_data.get("receiver_id")
        }

        return attacked_data