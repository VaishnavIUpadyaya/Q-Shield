from fastapi import APIRouter, HTTPException

from backend.schemas import ExperimentRequest, ExperimentResponse
from backend.services.experiment_service import run_experiment
from backend.services.history_service import save_experiment


router = APIRouter(
    prefix="/experiments",
    tags=["Experiments"]
)


@router.post(
    "",
    response_model=ExperimentResponse
)
def create_experiment(request: ExperimentRequest):

    try:
        result = run_experiment(request)

        save_experiment(result)

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )