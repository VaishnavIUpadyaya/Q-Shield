from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from experiments.firestore_storage import get_audit_events


router = APIRouter(
    prefix="/audit",
    tags=["Audit"]
)


@router.get("/events")
def list_audit_events(
    document_id: Optional[str] = Query(
        default=None,
        description="Filter events by document ID."
    )
):
    """
    Retrieve audit events from Firestore.

    Optionally filter events by document_id.
    """

    try:
        events = get_audit_events(
            document_id=document_id
        )

        # Newest events first when timestamps exist.
        events.sort(
            key=lambda event: event.get(
                "created_at",
                ""
            ),
            reverse=True
        )

        return {
            "count": len(events),
            "events": events
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Audit event storage is unavailable."
            )
        ) from exc