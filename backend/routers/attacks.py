from fastapi import APIRouter

from backend.schemas import AttackInfo


router = APIRouter(
    prefix="/attacks",
    tags=["Attacks"]
)


ATTACKS = [
    AttackInfo(
        attack_type="none",
        description="Legitimate signature verification without an attack."
    ),

    AttackInfo(
        attack_type="forgery",
        description="Attempts to forge or modify a digital signature."
    ),

    AttackInfo(
        attack_type="replay",
        description="Attempts to reuse a previously valid signature/session."
    ),

    AttackInfo(
        attack_type="impersonation",
        description="Attempts to act as an unauthorized signer."
    ),

    AttackInfo(
        attack_type="unauthorized_verification",
        description="Attempts verification without authorization."
    ),

    AttackInfo(
        attack_type="channel_manipulation",
        description="Attempts to alter the quantum communication channel."
    ),
]


@router.get("", response_model=list[AttackInfo])
def get_supported_attacks():
    return ATTACKS