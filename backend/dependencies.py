from typing import Callable, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from backend.services.auth_service import (
    decode_access_token,
    get_user_by_username,
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> Dict:
    """
    Validate the JWT access token and return the
    currently authenticated user.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)

    except Exception:
        raise credentials_exception

    user_id = payload.get("user_id")
    username = payload.get("username")
    role = payload.get("role")

    if not user_id or not username or not role:
        raise credentials_exception

    user = get_user_by_username(username)

    if not user:
        raise credentials_exception


    if user.get("user_id") != user_id:
        raise credentials_exception

    if user.get("role") != role:
        raise credentials_exception

    return user


def require_roles(*allowed_roles: str) -> Callable:
    """
    Create an RBAC dependency that allows only
    users with one of the specified roles.
    """

    def role_checker(
        current_user: Dict = Depends(get_current_user),
    ) -> Dict:

        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return role_checker