from typing import Dict, List, Optional, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from quantum.protocol import (
    SUPPORTED_MESSAGES,
    QDSSignature,
    sign,
    verify,
)
from backend.schemas import (
    ExperimentRequest,
    ExperimentResponse,
    AttackInfo,
)
from backend.routers import attacks, experiments, results
from backend.services.experiment_service import run_experiment
from backend.services.history_service import (
    save_experiment,
    get_all_experiments,
)
from experiments.metrics import summarize_results


app = FastAPI(
    title="Q-Shield API",
    description="Quantum Digital Signature verification and threat detection API",
    version="1.0.0",
)

# Enable CORS for Next.js / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include teammate routers
app.include_router(attacks.router)
app.include_router(experiments.router)
app.include_router(results.router)


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


@app.post("/simulation/run", response_model=ExperimentResponse)
def run_simulation_endpoint(request: ExperimentRequest):
    """
    Run an end-to-end quantum simulation with optional attack injection
    and statistical threat detection.
    """
    try:
        result = run_experiment(request)
        save_experiment(result)
        return result
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@app.get("/metrics")
def get_security_metrics():
    """
    Compute and return aggregated security metrics across all experiment trials.
    """
    history = get_all_experiments()

    if not history:
        return {
            "total_experiments": 0,
            "total_trials": 0,
            "total_attacks": 0,
            "total_legitimate": 0,
            "detected_attacks": 0,
            "false_accepts": 0,
            "false_rejects": 0,
            "detection_rate": 1.0,
            "false_acceptance_rate": 0.0,
            "false_rejection_rate": 0.0,
            "accuracy": 1.0,
            "forgery_probability": 0.0,
        }

    # Format trials for summarize_results
    trial_records = []
    for exp in history:
        attack_type = exp.get("attack_type", "none")
        detection = exp.get("detection_result") or {}
        is_attack = attack_type != "none"
        attack_detected = detection.get("attack_detected", is_attack)

        trial_records.append({
            "attack_type": attack_type,
            "detection_result": {
                "accepted": not attack_detected,
                "decision": "ACCEPT" if not attack_detected else "REJECT",
            },
        })

    summary = summarize_results(trial_records)
    summary["total_experiments"] = len(history)
    summary["forgery_probability"] = summary.get("false_acceptance_rate", 0.0)

    return summary


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