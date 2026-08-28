from detection.security import SecurityContext, validate_context


def test_fresh_valid_context_is_accepted():
    context = SecurityContext(
        signer_id="alice",
        message="PAY 100",
        nonce="session-001",
    )

    assert validate_context(
        signature_context=context,
        expected_signer="alice",
        expected_message="PAY 100",
        used_nonces=set(),
    ) is True


def test_replayed_nonce_is_rejected():
    context = SecurityContext(
        signer_id="alice",
        message="PAY 100",
        nonce="session-001",
    )

    assert validate_context(
        signature_context=context,
        expected_signer="alice",
        expected_message="PAY 100",
        used_nonces={"session-001"},
    ) is False


def test_wrong_signer_is_rejected():
    context = SecurityContext(
        signer_id="eve",
        message="PAY 100",
        nonce="session-001",
    )

    assert validate_context(
        signature_context=context,
        expected_signer="alice",
        expected_message="PAY 100",
        used_nonces=set(),
    ) is False


def test_wrong_message_is_rejected():
    context = SecurityContext(
        signer_id="alice",
        message="PAY 999",
        nonce="session-001",
    )

    assert validate_context(
        signature_context=context,
        expected_signer="alice",
        expected_message="PAY 100",
        used_nonces=set(),
    ) is False
    