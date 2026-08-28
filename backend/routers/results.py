from fastapi import APIRouter, HTTPException

from backend.services.history_service import (
    get_all_experiments,
    get_experiment,
)


router = APIRouter(
    prefix="/results",
    tags=["Results"]
)


@router.get("")
def list_results():
    return {
        "count": len(get_all_experiments()),
        "results": get_all_experiments()
    }


@router.get("/{experiment_id}")
def get_result(experiment_id: str):

    result = get_experiment(experiment_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Experiment not found"
        )

    return result