from typing import Dict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from quantum.protocol import (
    SUPPORTED_MESSAGES,
    QDSSignature,
    sign,
    verify,
)

from attacks import get_attack
from detection.attacks import flip_binary_outcomes
from detection.detector import detect_binary_anomaly


app = FastAPI(
    title="Q-Shield API",
    description="Quantum Digital Signature verification and threat detection API",
    version="1.0.0",
)


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class SignRequest(BaseModel):
    message: str
    signing_state: str = "default"


class VerifyRequest(BaseModel):
    message: str
    signing_state: str
    sender_measurement: str
    public_verification_info: Dict
    shots: int = 100


class VerifyResponse(BaseModel):
    valid: bool
    message: str
    measurement_counts: Dict[str, int]
    measurement_basis: str
    expected_distribution: Dict[str, float]


class AttackAndDetectRequest(BaseModel):
    message: str
    attack_type: str = "channel_manipulation"
    probability: float = 0.7
    shots: int = 1000


# ============================================================
# HELPER
# ============================================================

def qds_counts_to_binary(
    measurement_counts: Dict[str, int],
    expected_message: str,
) -> Dict[str, int]:
    """
    Convert real P1 QDS measurement counts into the binary format
    required by the existing P2 detector.

    "0" = expected / legitimate measurement outcome
    "1" = unexpected measurement outcome
    """

    legitimate = measurement_counts.get(
        expected_message,
        0,
    )

    total = sum(
        measurement_counts.values()
    )

    return {
        "0": legitimate,
        "1": total - legitimate,
    }


# ============================================================
# BASIC ENDPOINTS
# ============================================================

@app.get("/")
def root():
    return {
        "service": "Q-Shield",
        "status": "running",
        "supported_messages": sorted(
            SUPPORTED_MESSAGES
        ),
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# ============================================================
# P1: SIGN
# ============================================================

@app.post("/sign")
def create_signature(
    request: SignRequest,
):
    """
    P1 QDS signing endpoint.
    """

    try:
        signature = sign(
            message=request.message,
            signing_state=request.signing_state,
        )

        return {
            "message": signature.message,
            "signing_state":
                signature.signing_state,
            "sender_measurement":
                signature.sender_measurement,
            "public_verification_info":
                signature.public_verification_info,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# P1: VERIFY
# ============================================================

@app.post(
    "/verify",
    response_model=VerifyResponse,
)
def verify_signature(
    request: VerifyRequest,
):
    """
    Verify a QDS signature using P1 protocol logic.
    """

    try:
        signature = QDSSignature(
            message=request.message,
            signing_state=request.signing_state,
            sender_measurement=
                request.sender_measurement,
            public_verification_info=
                request.public_verification_info,
        )

        result = verify(
            signature,
            shots=request.shots,
        )

        return {
            "valid": result.valid,
            "message": result.message,
            "measurement_counts":
                result.measurement_counts,
            "measurement_basis":
                result.measurement_basis,
            "expected_distribution":
                result.expected_distribution,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# P1: SIGN AND VERIFY
# ============================================================

@app.post("/sign-and-verify")
def sign_and_verify(
    request: SignRequest,
):
    """
    Complete P1 real-time flow:

    Message
        ->
    QDS Sign
        ->
    QDS Verify
        ->
    API Response
    """

    try:
        signature = sign(
            message=request.message,
            signing_state=request.signing_state,
        )

        verification = verify(
            signature,
            shots=100,
        )

        return {
            "signature": {
                "message": signature.message,
                "signing_state":
                    signature.signing_state,
                "sender_measurement":
                    signature.sender_measurement,
                "public_verification_info":
                    signature.public_verification_info,
            },
            "verification": {
                "valid": verification.valid,
                "message": verification.message,
                "measurement_counts":
                    verification.measurement_counts,
                "measurement_basis":
                    verification.measurement_basis,
                "expected_distribution":
                    verification.expected_distribution,
            },
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# P1 -> P3 -> P2
#
# REAL P1 DATA
#       ->
# P3 CHANNEL ATTACK
#       ->
# P2 STATISTICAL DETECTION
# ============================================================

@app.post("/attack-and-detect")
def attack_and_detect(
    request: AttackAndDetectRequest,
):
    """
    Complete connected Q-Shield pipeline.

    P1:
        Generate a real QDS signature and verification result.

    P3:
        Apply channel manipulation to the measurement data.

    P2:
        Detect whether the attacked measurements are compatible
        with the expected legitimate result.
    """

    try:

        # ----------------------------------------------------
        # P1: REAL QDS SIGNING
        # ----------------------------------------------------

        signature = sign(
            message=request.message,
        )

        # ----------------------------------------------------
        # P1: REAL QDS VERIFICATION
        # ----------------------------------------------------

        verification = verify(
            signature,
            shots=request.shots,
        )

        # Convert REAL P1 QDS output into the binary format
        # used by the existing P2 statistical detector.
        original_binary_counts = (
            qds_counts_to_binary(
                verification.measurement_counts,
                verification.message,
            )
        )

        # ----------------------------------------------------
        # CREATE EXPERIMENT DATA FROM REAL P1 OUTPUT
        # ----------------------------------------------------

        experiment_data = {
            "message": signature.message,

            "signature": {
                "message":
                    signature.message,

                "signing_state":
                    signature.signing_state,

                "sender_measurement":
                    signature.sender_measurement,

                "public_verification_info":
                    signature.public_verification_info,

                "expected_state":
                    signature.signing_state,
            },

            "sender_id": "alice",
            "receiver_id": "bob",
            "session_id": "session-001",
            "timestamp": "current",

            "measurement_counts":
                verification.measurement_counts,

            "binary_counts":
                original_binary_counts,
        }

        # ----------------------------------------------------
        # P3: ATTACK REAL P1 DATA
        # ----------------------------------------------------

        if (
            request.attack_type
            != "channel_manipulation"
        ):
            raise ValueError(
                "This endpoint currently supports "
                "channel_manipulation only."
            )

        attack = get_attack(
            request.attack_type,
            manipulation_type="bit_flip",
            probability=request.probability,
        )

        attacked_data = attack.apply(
            experiment_data,
        )

        # Apply the attack to the REAL P1-derived counts.
        attacked_binary_counts = (
            flip_binary_outcomes(
                original_binary_counts,
                fraction=request.probability,
            )
        )

        attacked_data[
            "binary_counts"
        ] = attacked_binary_counts

        # ----------------------------------------------------
        # P2: DETECTION
        # ----------------------------------------------------

        detection = detect_binary_anomaly(
            counts=attacked_binary_counts,
            expected_probability=1.0,
        )

        # ----------------------------------------------------
        # FINAL CONNECTED RESPONSE
        # ----------------------------------------------------

        return {
            "pipeline": {
                "p1":
                    "real QDS signature and verification completed",

                "p3":
                    "channel manipulation applied to P1 measurement data",

                "p2":
                    "statistical anomaly detection completed",
            },

            "original": {
                "signature": {
                    "message":
                        signature.message,

                    "signing_state":
                        signature.signing_state,

                    "sender_measurement":
                        signature.sender_measurement,

                    "public_verification_info":
                        signature.public_verification_info,
                },

                "measurement_counts":
                    verification.measurement_counts,

                "binary_counts":
                    original_binary_counts,
            },

            "attack": {
                "type":
                    attacked_data["attack_type"],

                "metadata":
                    attacked_data["attack_metadata"],

                "binary_counts":
                    attacked_binary_counts,
            },

            "detection": {
                "accepted":
                    detection.accepted,

                "observed_probability":
                    detection.observed_probability,

                "expected_probability":
                    detection.expected_probability,

                "confidence":
                    detection.confidence,

                "interval":
                    detection.interval,
            },
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )