from typing import Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from quantum.protocol import (
    SUPPORTED_MESSAGES,
    QDSSignature,
    sign,
    verify,
)




app = FastAPI(
    title="Q-Shield API",
    description="Quantum Digital Signature verification and threat detection API",
    version="1.0.0",
)


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


@app.get("/")
def root():
    return {
        "service": "Q-Shield",
        "status": "running",
        "supported_messages": sorted(SUPPORTED_MESSAGES),
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


@app.post("/sign")
def create_signature(request: SignRequest):
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
            "signing_state": signature.signing_state,
            "sender_measurement": signature.sender_measurement,
            "public_verification_info": signature.public_verification_info,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@app.post("/verify", response_model=VerifyResponse)
def verify_signature(request: VerifyRequest):
    """
    Verify a QDS signature using P1 protocol logic.
    """

    try:
        signature = QDSSignature(
            message=request.message,
            signing_state=request.signing_state,
            sender_measurement=request.sender_measurement,
            public_verification_info=request.public_verification_info,
        )

        result = verify(
            signature,
            shots=request.shots,
        )

        return {
            "valid": result.valid,
            "message": result.message,
            "measurement_counts": result.measurement_counts,
            "measurement_basis": result.measurement_basis,
            "expected_distribution": result.expected_distribution,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@app.post("/sign-and-verify")
def sign_and_verify(request: SignRequest):
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
                "signing_state": signature.signing_state,
                "sender_measurement": signature.sender_measurement,
                "public_verification_info": signature.public_verification_info,
            },
            "verification": {
                "valid": verification.valid,
                "message": verification.message,
                "measurement_counts": verification.measurement_counts,
                "measurement_basis": verification.measurement_basis,
                "expected_distribution": verification.expected_distribution,
            },
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )