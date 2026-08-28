from copy import deepcopy
from .base import BaseAttack


class ReplayAttack(BaseAttack):

    def apply(self, experiment_data: dict) -> dict:

        attacked_data = deepcopy(experiment_data)

        attacked_data["attack_type"] = "replay"

        attacked_data["replayed"] = True

        attacked_data["attack_metadata"] = {
            "original_session_id":
                experiment_data.get("session_id"),

            "original_timestamp":
                experiment_data.get("timestamp")
        }

        return attacked_data