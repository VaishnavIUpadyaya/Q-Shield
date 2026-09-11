from fastapi import HTTPException
from fastapi.testclient import TestClient
from backend.main import app
from backend.routers import auth
from backend.dependencies import (
    get_current_user,
    require_roles,
)

client = TestClient(app)


def test_register_user(monkeypatch):
    created_user = {
        "user_id": "user-123",
        "username": "alice",
        "email": "alice@example.com",
        "role": "verifier",
    }

    monkeypatch.setattr(
        auth,
        "get_user_by_username",
        lambda username: None,
    )

    monkeypatch.setattr(
        auth,
        "get_user_by_email",
        lambda email: None,
    )

    monkeypatch.setattr(
        auth,
        "create_user",
        lambda **kwargs: created_user,
    )

    response = client.post(
        "/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "securepass123",
            "role": "verifier",
        },
    )

    assert response.status_code == 200
    assert response.json() == created_user


def test_register_rejects_privileged_role():
    response = client.post(
        "/auth/register",
        json={
            "username": "adminuser",
            "email": "admin@example.com",
            "password": "securepass123",
            "role": "admin",
        },
    )

    assert response.status_code == 403


def test_login_user(monkeypatch):
    fake_user = {
        "user_id": "user-123",
        "username": "alice",
        "email": "alice@example.com",
        "password_hash": "hashed-password",
        "role": "verifier",
    }

    monkeypatch.setattr(
        auth,
        "get_user_by_username",
        lambda username: fake_user,
    )

    monkeypatch.setattr(
        auth,
        "verify_password",
        lambda plain, hashed: True,
    )

    monkeypatch.setattr(
        auth,
        "create_access_token",
        lambda **kwargs: "test-access-token",
    )

    response = client.post(
        "/auth/login",
        json={
            "username": "alice",
            "password": "securepass123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["access_token"] == "test-access-token"
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "alice"
    assert data["user"]["role"] == "verifier"


def test_login_rejects_unknown_user(monkeypatch):
    monkeypatch.setattr(
        auth,
        "get_user_by_username",
        lambda username: None,
    )

    response = client.post(
        "/auth/login",
        json={
            "username": "unknown",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == (
        "Invalid username or password"
    )


def test_login_rejects_wrong_password(monkeypatch):
    fake_user = {
        "user_id": "user-123",
        "username": "alice",
        "email": "alice@example.com",
        "password_hash": "hashed-password",
        "role": "verifier",
    }

    monkeypatch.setattr(
        auth,
        "get_user_by_username",
        lambda username: fake_user,
    )

    monkeypatch.setattr(
        auth,
        "verify_password",
        lambda plain, hashed: False,
    )

    response = client.post(
        "/auth/login",
        json={
            "username": "alice",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401


def test_me_requires_authentication():
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_returns_current_user():
    fake_user = {
        "user_id": "user-123",
        "username": "alice",
        "email": "alice@example.com",
        "role": "verifier",
    }

    app.dependency_overrides[get_current_user] = (
        lambda: fake_user
    )

    try:
        response = client.get("/auth/me")

        assert response.status_code == 200
        assert response.json() == fake_user

    finally:
        app.dependency_overrides.clear()

def test_rbac_allows_authorized_role():
    fake_user = {
        "user_id": "admin-123",
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
    }

    app.dependency_overrides[get_current_user] = (
        lambda: fake_user
    )

    protected_dependency = require_roles("admin")

    try:
        result = protected_dependency(
            current_user=fake_user
        )

        assert result == fake_user

    finally:
        app.dependency_overrides.clear()


def test_rbac_rejects_unauthorized_role():
    fake_user = {
        "user_id": "user-123",
        "username": "alice",
        "email": "alice@example.com",
        "role": "verifier",
    }

    protected_dependency = require_roles("admin")

    try:
        protected_dependency(
            current_user=fake_user
        )

        assert False, "Expected HTTPException"

    except HTTPException as error:
        assert error.status_code == 403
        assert error.detail == "Insufficient permissions"