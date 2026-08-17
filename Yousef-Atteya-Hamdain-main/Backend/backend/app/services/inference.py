import json
import logging
from pathlib import Path

import joblib

from app.core.config import settings
from app.schemas.prediction import PredictionRequest
from app.services.preprocessing import request_to_dataframe

logger = logging.getLogger(__name__)


class ModelService:


    def __init__(self) -> None:
        self.model = None
        self.allowed_locations: set[str] = set()

    def load(self) -> None:
        model_path = Path(settings.model_path)
        locations_path = Path(settings.locations_path)

        if not model_path.exists():
            raise FileNotFoundError(
                f"Model file not found at {model_path}. "
            )

        logger.info("Loading model from %s", model_path)
        self.model = joblib.load(model_path)

        if locations_path.exists():
            with open(locations_path) as f:
                self.allowed_locations = set(json.load(f))
            logger.info("Loaded %d known locations", len(self.allowed_locations))
        else:
            logger.warning("locations.json not found — all locations will map to 'other'")

    def predict(self, request: PredictionRequest) -> float:
        if self.model is None:
            raise RuntimeError("Model is not loaded yet")

        df = request_to_dataframe(request, self.allowed_locations)
        prediction = self.model.predict(df)
        return float(prediction[0])


model_service = ModelService()
