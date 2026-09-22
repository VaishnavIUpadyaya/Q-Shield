import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore


PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env"

# Persistent local fallback storage.
AUDIT_DIR = PROJECT_ROOT / "dataset" / "audit"

SIGNED_DOCUMENTS_FILE = (
    AUDIT_DIR / "signed_documents.json"
)

AUDIT_EVENTS_FILE = (
    AUDIT_DIR / "audit_events.json"
)

EXPERIMENTS_FILE = (
    AUDIT_DIR / "experiments.json"
)

METRICS_FILE = (
    AUDIT_DIR / "metrics.json"
)


load_dotenv(ENV_FILE)


def _get_credential_path() -> Path:
    """
    Resolve the Firebase service-account credential path.

    GOOGLE_APPLICATION_CREDENTIALS may contain either
    an absolute path or a path relative to the project root.
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

    Raises:
        ValueError:
            If Firebase credentials are not configured.

        FileNotFoundError:
            If the Firebase credential file does not exist.
    """

    if not firebase_admin._apps:
        credential_path = (
            _get_credential_path()
        )

        cred = credentials.Certificate(
            str(credential_path)
        )

        firebase_admin.initialize_app(
            cred
        )

    return firestore.client()


def _utc_timestamp() -> str:
    """
    Return the current UTC timestamp in ISO format.
    """

    return datetime.now(
        timezone.utc
    ).isoformat()


def _load_local_records(
    file_path: Path,
) -> list[dict[str, Any]]:
    """
    Load records from a local JSON fallback file.

    Missing files are treated as empty storage.
    Invalid JSON raises an error so corrupted data
    is not silently discarded.
    """

    if not file_path.exists():
        return []

    with file_path.open(
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError(
            "Local storage file must contain "
            f"a JSON list: {file_path}"
        )

    return [
        record
        for record in data
        if isinstance(record, dict)
    ]


def _save_local_records(
    file_path: Path,
    records: list[dict[str, Any]],
) -> None:
    """
    Persist records to a local JSON fallback file.
    """

    AUDIT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    with file_path.open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            records,
            file,
            indent=2,
            ensure_ascii=False,
        )


def _save_local_record(
    file_path: Path,
    record: dict[str, Any],
    record_id_field: str,
) -> str:
    """
    Insert or replace a local JSON record using
    its identifier field.
    """

    records = _load_local_records(
        file_path
    )

    record_id = record.get(
        record_id_field
    )

    if not record_id:
        raise ValueError(
            "Record must contain "
            f"'{record_id_field}'."
        )

    updated = False

    for index, existing_record in enumerate(
        records
    ):
        if (
            existing_record.get(
                record_id_field
            )
            == record_id
        ):
            records[index] = record
            updated = True
            break

    if not updated:
        records.append(record)

    _save_local_records(
        file_path,
        records,
    )

    return str(record_id)


# =========================================================
# METRICS
# =========================================================


def _build_metrics(
    experiments: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Build global security metrics from experiment records.

    Uses the same summarize_results() implementation
    used by the /metrics endpoint.
    """

    from experiments.metrics import (
        summarize_results,
    )

    trial_records = []

    for experiment in experiments:
        attack_type = experiment.get(
            "attack_type",
            "none",
        )

        detection = experiment.get(
            "detection_result"
        ) or {}

        is_attack = (
            attack_type != "none"
        )

        attack_detected = detection.get(
            "attack_detected",
            is_attack,
        )

        trial_records.append(
            {
                "attack_type": attack_type,
                "detection_result": {
                    "accepted": (
                        not attack_detected
                    ),
                    "decision": (
                        "ACCEPT"
                        if not attack_detected
                        else "REJECT"
                    ),
                },
            }
        )

    if not trial_records:
        return {
            "total_trials": 0,
            "detected": 0,
            "accepted": 0,
            "detection_rate": 1.0,
            "total_attacks": 0,
            "total_legitimate": 0,
            "detected_attacks": 0,
            "false_accepts": 0,
            "false_rejects": 0,
            "false_acceptance_rate": 0.0,
            "false_rejection_rate": 0.0,
            "accuracy": 1.0,
            "total_experiments": 0,
            "forgery_probability": 0.0,
        }

    summary = summarize_results(
        trial_records
    )

    summary["total_experiments"] = len(
        experiments
    )

    summary["forgery_probability"] = (
        summary.get(
            "false_acceptance_rate",
            0.0,
        )
    )

    return summary


def _update_global_metrics(
    experiments: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Recalculate and persist global security metrics.

    Primary storage:
        Firestore collection: metrics
        Firestore document: global

    Fallback storage:
        dataset/audit/metrics.json
    """

    metrics = _build_metrics(
        experiments
    )

    metrics["updated_at"] = (
        _utc_timestamp()
    )

    try:
        client = _get_firestore_client()

        document_ref = (
            client
            .collection("metrics")
            .document("global")
        )

        document_ref.set(
            metrics
        )

        return metrics

    except Exception:
        _save_local_records(
            METRICS_FILE,
            [metrics],
        )

        return metrics


def get_global_metrics() -> dict[str, Any]:
    """
    Retrieve the latest global security metrics.

    Primary source:
        Firestore collection: metrics
        Firestore document: global

    Fallback source:
        dataset/audit/metrics.json
    """

    try:
        client = _get_firestore_client()

        document = (
            client
            .collection("metrics")
            .document("global")
            .get()
        )

        if document.exists:
            metrics = (
                document.to_dict()
                or {}
            )

            return metrics

        # No global metrics document exists yet.
        experiments = (
            get_experiments_from_firestore()
        )

        return _update_global_metrics(
            experiments
        )

    except Exception:
        records = _load_local_records(
            METRICS_FILE
        )

        if records:
            return records[0]

        # No local metrics file yet.
        experiments = _load_local_records(
            EXPERIMENTS_FILE
        )

        metrics = _build_metrics(
            experiments
        )

        metrics["updated_at"] = (
            _utc_timestamp()
        )

        _save_local_records(
            METRICS_FILE,
            [metrics],
        )

        return metrics


# =========================================================
# EXPERIMENT STORAGE
# =========================================================


def save_experiment_to_firestore(
    result: dict,
) -> str:
    """
    Save a completed experiment result and refresh
    global security metrics.

    Primary storage:
        Firestore collection: experiments
        Firestore collection: metrics/global

    Fallback storage:
        dataset/audit/experiments.json
        dataset/audit/metrics.json
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

    # -----------------------------------------------------
    # Try Firestore first.
    # -----------------------------------------------------

    try:
        client = _get_firestore_client()

        document_ref = (
            client
            .collection("experiments")
            .document(experiment_id)
        )

        document_ref.set(
            result
        )

        # Read the latest Firestore experiment set
        # and refresh the global metrics document.
        experiments = (
            get_experiments_from_firestore()
        )

        _update_global_metrics(
            experiments
        )

        return document_ref.id

    except Exception:
        # -------------------------------------------------
        # Firebase unavailable -> local JSON fallback.
        # -------------------------------------------------

        saved_id = _save_local_record(
            EXPERIMENTS_FILE,
            result,
            "experiment_id",
        )

        # Recalculate metrics from local experiments.
        experiments = _load_local_records(
            EXPERIMENTS_FILE
        )

        _update_local_global_metrics(
            experiments
        )

        return saved_id


def get_experiments_from_firestore() -> list[
    dict[str, Any]
]:
    """
    Retrieve experiment records.

    Primary source:
        Firestore collection: experiments

    Fallback source:
        dataset/audit/experiments.json
    """

    try:
        client = _get_firestore_client()

        documents = (
            client
            .collection("experiments")
            .stream()
        )

        experiments = []

        for document in documents:
            experiment = (
                document.to_dict()
                or {}
            )

            experiment["experiment_id"] = (
                document.id
            )

            experiments.append(
                experiment
            )

        return experiments

    except Exception:
        return _load_local_records(
            EXPERIMENTS_FILE
        )


def _update_local_global_metrics(
    experiments: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Update only the local metrics fallback.

    This helper prevents a Firebase failure during
    experiment persistence from causing another Firebase
    attempt while refreshing metrics.
    """

    metrics = _build_metrics(
        experiments
    )

    metrics["updated_at"] = (
        _utc_timestamp()
    )

    _save_local_records(
        METRICS_FILE,
        [metrics],
    )

    return metrics


# =========================================================
# SIGNED DOCUMENT STORAGE
# =========================================================


def save_signed_document(
    document: dict,
) -> str:
    """
    Save a signed document record.

    Primary storage:
        Firestore collection: signed_documents

    Fallback storage:
        dataset/audit/signed_documents.json
    """

    if not isinstance(document, dict):
        raise ValueError(
            "Document must be a dictionary."
        )

    document_id = document.get(
        "document_id"
    )

    if not document_id:
        raise ValueError(
            "Document must contain "
            "'document_id'."
        )

    document_data = {
        **document,
        "created_at": document.get(
            "created_at",
            _utc_timestamp(),
        ),
    }

    try:
        client = _get_firestore_client()

        document_ref = (
            client
            .collection("signed_documents")
            .document(document_id)
        )

        document_ref.set(
            document_data
        )

        return document_ref.id

    except Exception:
        return _save_local_record(
            SIGNED_DOCUMENTS_FILE,
            document_data,
            "document_id",
        )


# =========================================================
# AUDIT EVENTS
# =========================================================


def save_audit_event(
    event: dict,
) -> str:
    """
    Save a verification or tamper event.

    Primary storage:
        Firestore collection: audit_events

    Fallback storage:
        dataset/audit/audit_events.json
    """

    if not isinstance(event, dict):
        raise ValueError(
            "Event must be a dictionary."
        )

    event_id = event.get(
        "event_id"
    )

    if not event_id:
        raise ValueError(
            "Event must contain "
            "'event_id'."
        )

    event_data = {
        **event,
        "created_at": event.get(
            "created_at",
            _utc_timestamp(),
        ),
    }

    try:
        client = _get_firestore_client()

        document_ref = (
            client
            .collection("audit_events")
            .document(event_id)
        )

        document_ref.set(
            event_data
        )

        return document_ref.id

    except Exception:
        return _save_local_record(
            AUDIT_EVENTS_FILE,
            event_data,
            "event_id",
        )


def get_audit_events(
    document_id: str | None = None,
) -> list[dict[str, Any]]:
    """
    Retrieve audit events.

    Primary source:
        Firestore collection: audit_events

    Fallback source:
        dataset/audit/audit_events.json

    If document_id is provided, only events associated
    with that document are returned.
    """

    try:
        client = _get_firestore_client()

        query = client.collection(
            "audit_events"
        )

        if document_id:
            query = query.where(
                "document_id",
                "==",
                document_id,
            )

        documents = query.stream()

        events = []

        for document in documents:
            event = (
                document.to_dict()
                or {}
            )

            event["event_id"] = (
                document.id
            )

            events.append(event)

        return events

    except Exception:
        events = _load_local_records(
            AUDIT_EVENTS_FILE
        )

        if document_id:
            events = [
                event
                for event in events
                if event.get(
                    "document_id"
                ) == document_id
            ]

        return events