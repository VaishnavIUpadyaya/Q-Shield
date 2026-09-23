
import sys
from pathlib import Path
from typing import Dict
from experiments.firestore_storage import get_global_metrics
# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


from quantum.protocol import (
    SUPPORTED_MESSAGES,
    QDSSignature,
    sign,
    verify,
)

from backend.schemas import (
    ExperimentRequest,
    ExperimentResponse,
)

from backend.routers import (
    attacks,
    experiments,
    results,
    auth,
    documents,
    audit,
)

from backend.services.experiment_service import (
    run_experiment,
)

from backend.services.history_service import (
    save_experiment,
    
)

from experiments.firestore_storage import get_experiments_from_firestore

from experiments.metrics import summarize_results


app = FastAPI(
    title="Q-Shield API",
    description=(
        "Quantum Digital Signature verification "
        "and threat detection API"
    ),
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS configuration
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://q-shield-pi.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Router registration
# ---------------------------------------------------------

app.include_router(attacks.router)
app.include_router(experiments.router)
app.include_router(results.router)
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(audit.router)


# ---------------------------------------------------------
# Request and response models
# ---------------------------------------------------------


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


# ---------------------------------------------------------
# Basic endpoints
# ---------------------------------------------------------


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


# ---------------------------------------------------------
# Simulation endpoint
# ---------------------------------------------------------


@app.post(
    "/simulation/run",
    response_model=ExperimentResponse,
)
def run_simulation_endpoint(
    request: ExperimentRequest,
):
    """
    Run an end-to-end quantum simulation with optional
    attack injection and statistical threat detection.

    The experiment is saved through save_experiment(),
    which handles in-memory storage and attempts
    Firestore persistence.
    """

    try:
        result = run_experiment(request)

        # save_experiment handles:
        # 1. In-memory history
        # 2. Firestore persistence with fallback
        save_experiment(result)

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


# ---------------------------------------------------------
# Security metrics endpoint
# ---------------------------------------------------------


@app.get("/metrics")
def get_security_metrics():
    """
    Return the latest global security metrics.

    Primary source:
        Firestore collection: metrics
        Firestore document: global

    Fallback source:
        dataset/audit/metrics.json
    """
    return get_global_metrics()
#//=====
# @app.get("/metrics")
# def get_security_metrics():
#     """
#     Compute and return aggregated security metrics
#     across all locally available experiment records.
#     """

#     history = get_experiments_from_firestore()

#     if not history:
#         return {
#             "total_experiments": 0,
#             "total_trials": 0,
#             "total_attacks": 0,
#             "total_legitimate": 0,
#             "detected_attacks": 0,
#             "false_accepts": 0,
#             "false_rejects": 0,
#             "detection_rate": 1.0,
#             "false_acceptance_rate": 0.0,
#             "false_rejection_rate": 0.0,
#             "accuracy": 1.0,
#             "forgery_probability": 0.0,
#         }

#     # Format experiments for summarize_results
#     trial_records = []

#     for experiment in history:
#         attack_type = experiment.get(
#             "attack_type",
#             "none",
#         )

#         detection = experiment.get(
#             "detection_result"
#         ) or {}

#         is_attack = attack_type != "none"

#         attack_detected = detection.get(
#             "attack_detected",
#             is_attack,
#         )

#         trial_records.append(
#             {
#                 "attack_type": attack_type,
#                 "detection_result": {
#                     "accepted": not attack_detected,
#                     "decision": (
#                         "ACCEPT"
#                         if not attack_detected
#                         else "REJECT"
#                     ),
#                 },
#             }
#         )

#     summary = summarize_results(trial_records)

#     summary["total_experiments"] = len(history)

#     summary["forgery_probability"] = summary.get(
#         "false_acceptance_rate",
#         0.0,
#     )

#     return summary


# ---------------------------------------------------------
# P1 QDS signing endpoint
# ---------------------------------------------------------


@app.post("/sign")
def create_signature(
    request: SignRequest,
):
    """
    Create a P1 quantum digital signature.
    """

    try:
        signature = sign(
            message=request.message,
            signing_state=request.signing_state,
        )

        return {
            "message": signature.message,
            "signing_state": signature.signing_state,
            "sender_measurement": (
                signature.sender_measurement
            ),
            "public_verification_info": (
                signature.public_verification_info
            ),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


# ---------------------------------------------------------
# P1 QDS verification endpoint
# ---------------------------------------------------------


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
            sender_measurement=request.sender_measurement,
            public_verification_info=(
                request.public_verification_info
            ),
        )

        result = verify(
            signature,
            shots=request.shots,
        )

        return {
            "valid": result.valid,
            "message": result.message,
            "measurement_counts": (
                result.measurement_counts
            ),
            "measurement_basis": (
                result.measurement_basis
            ),
            "expected_distribution": (
                result.expected_distribution
            ),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


# ---------------------------------------------------------
# Combined sign-and-verify endpoint
# ---------------------------------------------------------


@app.post("/sign-and-verify")
def sign_and_verify(
    request: SignRequest,
):
    """
    Complete P1 real-time flow:

    Message -> QDS Sign -> QDS Verify -> API Response
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
                "sender_measurement": (
                    signature.sender_measurement
                ),
                "public_verification_info": (
                    signature.public_verification_info
                ),
            },
            "verification": {
                "valid": verification.valid,
                "message": verification.message,
                "measurement_counts": (
                    verification.measurement_counts
                ),
                "measurement_basis": (
                    verification.measurement_basis
                ),
                "expected_distribution": (
                    verification.expected_distribution
                ),
            },
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


# ---------------------------------------------------------
# Local development entry point
# ---------------------------------------------------------


if __name__ == "__main__":
    import uvicorn

    print(
        "Starting Q-SHIELD Backend on "
        "http://127.0.0.1:8000 ..."
    )

    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        app_dir=str(PROJECT_ROOT),
    )
