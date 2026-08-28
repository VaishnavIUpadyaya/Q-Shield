from fastapi import FastAPI

from backend.routers import attacks
from backend.routers import experiments
from backend.routers import health
from backend.routers import results


app = FastAPI(
    title="Q-Shield API",
    description="Q-Shield experiment and threat detection API",
    version="1.0.0",
)

app.include_router(health.router)
app.include_router(attacks.router)
app.include_router(experiments.router)
app.include_router(results.router)