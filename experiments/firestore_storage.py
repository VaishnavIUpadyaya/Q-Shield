import os

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore


load_dotenv()


def _get_firestore_client():
    """
    Initialize and return the Firestore client.

    Firebase is initialized only once for the process.
    """

    if not firebase_admin._apps:
        credential_path = os.getenv(
            "GOOGLE_APPLICATION_CREDENTIALS"
        )

        if not credential_path:
            raise ValueError(
                "GOOGLE_APPLICATION_CREDENTIALS "
                "is not configured."
            )

        if not os.path.exists(credential_path):
            raise FileNotFoundError(
                f"Firebase credential file not found: "
                f"{credential_path}"
            )

        cred = credentials.Certificate(
            credential_path
        )

        firebase_admin.initialize_app(cred)

    return firestore.client()


def save_experiment_to_firestore(
    result: dict,
) -> str:
    """
    Save a completed experiment result to Firestore.

    Returns the Firestore document ID.
    """

    if not isinstance(result, dict):
        raise ValueError(
            "Experiment result must be a dictionary."
        )

    client = _get_firestore_client()

    experiment_id = result.get("experiment_id")

    if not experiment_id:
        raise ValueError(
            "Experiment result must contain "
            "'experiment_id'."
        )

    document_ref = (
        client
        .collection("experiments")
        .document(experiment_id)
    )

    document_ref.set(result)

    return document_ref.id