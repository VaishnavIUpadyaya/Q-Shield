from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["service"] == "Q-Shield"
    assert data["status"] == "running"


def test_health():
    response = client.get("/health")

    assert response.status_code == 200

    assert response.json() == {
        "status": "healthy",
    }


def test_sign():
    response = client.post(
        "/sign",
        json={
            "message": "00",
            "signing_state": "default",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "00"
    assert "sender_measurement" in data
    assert "public_verification_info" in data


def test_sign_rejects_invalid_message():
    response = client.post(
        "/sign",
        json={
            "message": "invalid",
            "signing_state": "default",
        },
    )

    assert response.status_code == 400


def test_sign_and_verify():
    response = client.post(
        "/sign-and-verify",
        json={
            "message": "00",
            "signing_state": "default",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["signature"]["message"] == "00"

    assert data["verification"]["valid"] is True

    assert data["verification"]["measurement_counts"]["00"] == 100


def test_all_supported_messages():
    for message in ["00", "01", "10", "11"]:

        response = client.post(
            "/sign-and-verify",
            json={
                "message": message,
                "signing_state": "default",
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["verification"]["valid"] is True
        assert data["verification"]["message"] == message