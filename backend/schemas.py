from typing import Any, Dict, List, Optional, Literal

from pydantic import BaseModel, Field


class ExperimentRequest(BaseModel):
    message: str = Field(
        ...,
        description="QDS message. Supported values: 00, 01, 10, 11",
    )

    shots: int = Field(
        default=1000,
        ge=1,
        le=100000,
    )

    trials: int = Field(
        default=1,
        ge=1,
        le=1000,
    )

    attack_type: str = Field(
        default="none",
        description="Attack scenario to simulate",
    )

    attack_fraction: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Fraction of measurement outcomes modified by attack",
    )

    measurement_basis: str = Field(
        default="Z",
        description="Measurement basis",
    )


class MeasurementResult(BaseModel):
    basis: str
    shots: int
    counts: Dict[str, int]
    probabilities: Dict[str, float]


class DetectionResult(BaseModel):
    decision: str
    attack_detected: bool
    statistical_method: Optional[str] = None
    statistic: Optional[float] = None
    deviation: Optional[float] = None
    p_value: Optional[float] = None
    confidence_interval: Optional[List[float]] = None
    reason: str


class ExperimentResponse(BaseModel):
    experiment_id: str
    status: str

    message: str

    attack_type: str
    shots: int
    trials: int

    measurements: Dict[str, Any] = {}

    verification_result: Optional[str] = None

    detection_result: Optional[DetectionResult] = None

    created_at: str


class AttackInfo(BaseModel):
    attack_type: str
    description: str

UserRole = Literal["signer", "verifier", "admin", "adversary"]


class UserRegister(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
    )
    email: str = Field(
        ...,
        min_length=5,
        max_length=100,
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
    )
    role: UserRole = "verifier"


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    role: UserRole


class TokenPayload(BaseModel):
    user_id: str
    username: str
    role: UserRole
    exp: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse