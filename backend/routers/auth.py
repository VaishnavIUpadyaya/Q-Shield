from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies import get_current_user
from backend.schemas import (
    UserLogin,
    UserRegister,
    UserResponse,
    TokenResponse,
)
from backend.services.auth_service import (
    create_access_token,
    create_user,
    get_user_by_email,
    get_user_by_username,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
)
def register_user(request: UserRegister):
    """
    Register a new Q-Shield user.

    Public registration creates only a verifier account.
    Privileged roles must not be self-assigned.
    """

    if request.role != "verifier":
        raise HTTPException(
            status_code=403,
            detail="Public registration is restricted to the verifier role",
        )

    if get_user_by_username(request.username):
        raise HTTPException(
            status_code=409,
            detail="Username already exists",
        )

    if get_user_by_email(request.email):
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )

    user_id = str(uuid4())

    user = create_user(
        user_id=user_id,
        username=request.username,
        email=request.email,
        password=request.password,
        role=request.role,
    )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(request: UserLogin):
    """
    Authenticate a user and return a JWT access token.
    """

    user = get_user_by_username(request.username)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if not verify_password(
        request.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    access_token = create_access_token(
        user_id=user["user_id"],
        username=user["username"],
        role=user["role"],
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
        },
    }

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: dict = Depends(get_current_user),
):
    """
    Return the currently authenticated user's information.
    """
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
    }