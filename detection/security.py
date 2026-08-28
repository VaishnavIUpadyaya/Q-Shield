"""Protocol-level security checks for Q-Shield."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SecurityContext:
    """Context that binds a signature to a protocol session."""

    signer_id: str
    message: str
    nonce: str


def validate_context(
    signature_context: SecurityContext,
    expected_signer: str,
    expected_message: str,
    used_nonces: set[str],
) -> bool:
    """Validate signer, message, and nonce freshness.

    This is a protocol/application-level check. It is separate from
    quantum measurement-statistics verification.
    """

    if signature_context.signer_id != expected_signer:
        return False

    if signature_context.message != expected_message:
        return False

    if signature_context.nonce in used_nonces:
        return False

    return True