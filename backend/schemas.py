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


# -------------------------------------------------------------
# Document QDS Schemas (Multi-Block Quantum Seal)
# -------------------------------------------------------------

class BlockSignatureSchema(BaseModel):
    message: str
    signing_state: str
    sender_measurement: str
    public_verification_info: Dict[str, Any]


class DocumentSignRequest(BaseModel):
    document_base64: Optional[str] = Field(
        default=None,
        description="Base64-encoded raw file content",
    )
    document_text: Optional[str] = Field(
        default=None,
        description="UTF-8 plain text content of document",
    )
    document_hash: Optional[str] = Field(
        default=None,
        description="Precomputed SHA-256 hex string",
    )
    signer_id: str = Field(
        default="Alice",
        description="Identifier of the quantum signer",
    )


class DocumentSignResponse(BaseModel):
    document_hash: str
    signer_id: str
    total_blocks: int
    quantum_seal: str
    created_at: str
    signatures: List[BlockSignatureSchema]
    status: str = "signed"


class DocumentVerifyRequest(BaseModel):
    document_base64: Optional[str] = Field(
        default=None,
        description="Base64-encoded raw file content to verify",
    )
    document_text: Optional[str] = Field(
        default=None,
        description="UTF-8 plain text content of document to verify",
    )
    document_hash: Optional[str] = Field(
        default=None,
        description="SHA-256 hex digest to verify against",
    )
    quantum_signature: Dict[str, Any] = Field(
        ...,
        description="Quantum seal signature payload returned from /documents/sign",
    )
    shots: int = Field(
        default=100,
        ge=1,
        le=10000,
        description="Measurement shots per quantum block",
    )


class DocumentVerifyResponse(BaseModel):
    valid: bool
    verification_score: float
    document_hash: str
    total_blocks: int
    valid_blocks: int
    invalid_blocks: int
    tampered: bool
    signer_id: Optional[str] = None
    status: str
    details: Dict[str, Any] = {}


class DocumentHashResponse(BaseModel):
    document_hash: str
    total_blocks: int
    chunks: List[str]