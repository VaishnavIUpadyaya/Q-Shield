import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

import bcrypt
import jwt
from dotenv import load_dotenv

from experiments.firestore_storage import _get_firestore_client




load_dotenv()

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "development-only-secret",
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
        "60",
    )
)




def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    """
    password_bytes = password.encode("utf-8")

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    )

    return hashed.decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against a bcrypt hash.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )



def get_user_by_username(
    username: str,
) -> Optional[Dict]:
    """
    Find a user by username in Firestore.
    """

    client = _get_firestore_client()

    results = (
        client
        .collection("users")
        .where(
            "username",
            "==",
            username,
        )
        .limit(1)
        .stream()
    )

    for document in results:
        user = document.to_dict()
        user["user_id"] = document.id
        return user

    return None


def get_user_by_email(
    email: str,
) -> Optional[Dict]:
    """
    Find a user by email in Firestore.
    """

    client = _get_firestore_client()

    results = (
        client
        .collection("users")
        .where(
            "email",
            "==",
            email,
        )
        .limit(1)
        .stream()
    )

    for document in results:
        user = document.to_dict()
        user["user_id"] = document.id
        return user

    return None


def create_user(
    user_id: str,
    username: str,
    email: str,
    password: str,
    role: str,
) -> Dict:
    """
    Create a user in the Firestore users collection.

    The password is NEVER stored in plain text.
    """

    client = _get_firestore_client()

    password_hash = hash_password(password)

    user_data = {
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    (
        client
        .collection("users")
        .document(user_id)
        .set(user_data)
    )

    return {
        "user_id": user_id,
        "username": username,
        "email": email,
        "role": role,
    }




def create_access_token(
    user_id: str,
    username: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a signed JWT access token.
    """

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "iat": now,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )




def decode_access_token(
    token: str,
) -> Dict:
    """
    Decode and validate a JWT.

    Raises:
        jwt.InvalidTokenError:
            If the token is invalid or expired.
    """

    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )