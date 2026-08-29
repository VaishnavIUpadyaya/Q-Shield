import os
from pathlib import Path

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore


PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Explicitly load the project's root .env file.
ENV_FILE = PROJECT_ROOT / ".env"
load_dotenv(ENV_FILE)


def _get_credential_path() -> Path:
    """
    Resolve the Firebase service-account credential path.

    GOOGLE_APPLICATION_CREDENTIALS may contain either:
      - an absolute path, or
      - a path relative to the Q-Shield project root.

    This prevents the credential path from depending on the
    directory from which Uvicorn was started.
    """

    credential_path_value = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS"
    )

    if not credential_path_value:
        raise ValueError(
            "GOOGLE_APPLICATION_CREDENTIALS "
            "is not configured."
        )

    credential_path = Path(
        credential_path_value
    ).expanduser()

    if not credential_path.is_absolute():
        credential_path = (
            PROJECT_ROOT / credential_path
        )

    credential_path = credential_path.resolve()

    if not credential_path.exists():
        raise FileNotFoundError(
            "Firebase credential file not found: "
            f"{credential_path}"
        )

    if not credential_path.is_file():
        raise FileNotFoundError(
            "Firebase credential path is not a file: "
            f"{credential_path}"
        )

    return credential_path


def _get_firestore_client():
    """
    Initialize and return the Firestore client.

    Firebase is initialized only once per process.
    """

    if not firebase_admin._apps:
        credential_path = _get_credential_path()

        cred = credentials.Certificate(
            str(credential_path)
        )

        firebase_admin.initialize_app(cred)

    return firestore.client()


def save_experiment_to_firestore(
    result: dict,
) -> str:
    """
    Save a completed experiment result to Firestore.

    The experiment ID is used as the Firestore document ID.

    Returns:
        str: Firestore document ID.
    """

    if not isinstance(result, dict):
        raise ValueError(
            "Experiment result must be a dictionary."
        )

    experiment_id = result.get(
        "experiment_id"
    )

    if not experiment_id:
        raise ValueError(
            "Experiment result must contain "
            "'experiment_id'."
        )

    client = _get_firestore_client()

    document_ref = (
        client
        .collection("experiments")
        .document(experiment_id)
    )

    document_ref.set(result)

    return document_ref.id