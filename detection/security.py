"""Protocol-level security checks for Q-Shield."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SecurityContext:
    """Context that binds a signature to a protocol session and authenticated identity."""

    signer_id: str
    message: str
    nonce: str
    user_id: str = ""
    role: str = "signer"


def validate_context(
    signature_context: SecurityContext,
    expected_signer: str,
    expected_message: str,
    used_nonces: set[str],
    allowed_roles: tuple[str, ...] = ("signer", "admin"),
) -> bool:
    """Validate signer, message, nonce freshness, and user identity/role.

    This is a protocol/application-level check. It is separate from
    quantum measurement-statistics verification. Rejects impersonation attempts
    from unauthorized roles (e.g., verifier, adversary) or mismatched user IDs.
    """

    if signature_context.role not in allowed_roles:
        return False

    if (
        signature_context.user_id
        and signature_context.user_id != signature_context.signer_id
        and signature_context.user_id != expected_signer
    ):
        return False

    if signature_context.signer_id != expected_signer:
        return False

    if signature_context.message != expected_message:
        return False

    if signature_context.nonce in used_nonces:
        return False

    return True