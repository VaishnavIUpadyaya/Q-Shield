import pytest

from attacks import get_attack


def sample_experiment():
    return {
        "experiment_id": "EXP001",
        "message": "HELLO",
        "sender_id": "alice",
        "receiver_id": "bob",
        "session_id": "SESSION123",
        "timestamp": 1234567890,

        "signature": {
            "basis": "Z",
            "expected_state": "0"
        },

        "measurements": {
            "0": 950,
            "1": 50
        }
    }


def test_forgery_attack():

    attack = get_attack(
        "forgery",
        forged_state="1"
    )

    result = attack.apply(sample_experiment())

    assert result["attack_type"] == "forgery"

    assert (
        result["signature"]["expected_state"]
        == "1"
    )


def test_replay_attack():

    attack = get_attack("replay")

    result = attack.apply(sample_experiment())

    assert result["attack_type"] == "replay"

    assert result["replayed"] is True


def test_impersonation_attack():

    attack = get_attack(
        "impersonation",
        attacker_id="mallory"
    )

    result = attack.apply(sample_experiment())

    assert result["attack_type"] == "impersonation"

    assert result["claimed_sender_id"] == "alice"

    assert result["actual_sender_id"] == "mallory"


def test_unauthorized_verification_attack():

    attack = get_attack(
        "unauthorized_verification",
        verifier_id="eve"
    )

    result = attack.apply(sample_experiment())

    assert (
        result["attack_type"]
        == "unauthorized_verification"
    )

    assert result["requested_verifier"] == "eve"


def test_channel_manipulation_attack():

    attack = get_attack(
        "channel_manipulation",
        manipulation_type="bit_flip",
        probability=0.2
    )

    result = attack.apply(sample_experiment())

    assert (
        result["attack_type"]
        == "channel_manipulation"
    )

    assert (
        result["channel_attack"]["type"]
        == "bit_flip"
    )

    assert (
        result["channel_attack"]["probability"]
        == 0.2
    )


def test_invalid_channel_probability():

    with pytest.raises(ValueError):

        get_attack(
            "channel_manipulation",
            probability=1.5
        )


def test_unknown_attack():

    with pytest.raises(ValueError):

        get_attack("unknown_attack")