from .forgery import ForgeryAttack
from .replay import ReplayAttack
from .impersonation import ImpersonationAttack
from .unauthorized import UnauthorizedVerificationAttack
from .channel import ChannelManipulationAttack


ATTACKS = {
    "forgery": ForgeryAttack,
    "replay": ReplayAttack,
    "impersonation": ImpersonationAttack,
    "unauthorized_verification":
        UnauthorizedVerificationAttack,
    "channel_manipulation":
        ChannelManipulationAttack,
}


def get_attack(attack_type: str, **kwargs):

    if attack_type not in ATTACKS:
        raise ValueError(
            f"Unknown attack type: {attack_type}"
        )

    return ATTACKS[attack_type](**kwargs)