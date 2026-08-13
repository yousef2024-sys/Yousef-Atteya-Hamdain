from fastapi import APIRouter, HTTPException

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services.inference import model_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    try:
        price = model_service.predict(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return PredictionResponse(predicted_price=round(price, 2))
