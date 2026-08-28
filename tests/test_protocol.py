import pytest

from quantum.protocol import (
    QDSSignature,
    QDSVerificationResult,
    sign,
    verify,
)


@pytest.mark.parametrize(
    "message",
    ["00", "01", "10", "11"],
)
def test_sign_accepts_supported_messages(message):

    signature = sign(message)

    assert isinstance(signature, QDSSignature)
    assert signature.message == message
    assert signature.sender_measurement in {
        "00",
        "01",
        "10",
        "11",
    }

    assert "public_key" in (
        signature.public_verification_info
    )


def test_sign_rejects_invalid_message():

    with pytest.raises(ValueError):
        sign("000")


def test_verify_returns_required_fields():

    signature = sign("00")

    result = verify(
        signature,
        shots=100,
    )

    assert isinstance(
        result,
        QDSVerificationResult,
    )

    assert result.measurement_basis == "Z"

    assert set(result.measurement_counts) == {
        "00",
        "01",
        "10",
        "11",
    }

    assert set(result.expected_distribution) == {
        "00",
        "01",
        "10",
        "11",
    }


@pytest.mark.parametrize(
    "message",
    ["00", "01", "10", "11"],
)
def test_legitimate_signature_verifies(message):

    signature = sign(message)

    result = verify(
        signature,
        shots=100,
    )

    assert result.valid is True
    assert result.measurement_counts[message] == 100


def test_verify_rejects_invalid_shots():

    signature = sign("00")

    with pytest.raises(ValueError):
        verify(
            signature,
            shots=0,
        )