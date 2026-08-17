from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):

    location: str = Field(..., description="City/area name, e.g. 'thane'")
    carpet_area_sqft: float = Field(..., gt=0, description="Carpet area in square feet")
    floor_num: int = Field(..., description="Floor number (0 = ground, -1 = basement)")
    bathroom: int = Field(..., ge=0, description="Number of bathrooms")
    balcony: int = Field(..., ge=0, description="Number of balconies")
    furnishing: str = Field(..., description="'Furnished' | 'Semi-Furnished' | 'Unfurnished'")
    transaction: str = Field(..., description="'New Property' | 'Resale'")
    ownership: str = Field(..., description="e.g. 'Freehold', 'Leasehold', 'Unknown'")
    facing: str = Field(..., description="e.g. 'East', 'North', 'Unknown'")

    model_config = {
        "json_schema_extra": {
            "example": {
                "location": "thane",
                "carpet_area_sqft": 650,
                "floor_num": 3,
                "bathroom": 2,
                "balcony": 1,
                "furnishing": "Semi-Furnished",
                "transaction": "Resale",
                "ownership": "Freehold",
                "facing": "East",
            }
        }
    }


class PredictionResponse(BaseModel):
    predicted_price: float


class HealthResponse(BaseModel):
    status: str
