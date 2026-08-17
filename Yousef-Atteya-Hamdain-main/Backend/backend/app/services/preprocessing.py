import pandas as pd

from app.schemas.prediction import PredictionRequest

# Must match the columns/order used when training the model in the notebook.
NUMERIC_FEATURES = ["carpet_area_sqft", "floor_num", "bathroom", "balcony"]
CATEGORICAL_FEATURES = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]


def request_to_dataframe(request: PredictionRequest, allowed_locations: set[str]) -> pd.DataFrame:


    location = request.location.strip().lower()
    location_grouped = location if location in allowed_locations else "other"

    row = {
        "carpet_area_sqft": request.carpet_area_sqft,
        "floor_num": request.floor_num,
        "bathroom": request.bathroom,
        "balcony": request.balcony,
        "location_grouped": location_grouped,
        "Furnishing": request.furnishing,
        "Transaction": request.transaction,
        "Ownership": request.ownership,
        "facing": request.facing,
    }
    return pd.DataFrame([row], columns=NUMERIC_FEATURES + CATEGORICAL_FEATURES)
