# House Price Prediction — End-to-End ML Web App

Predict Indian residential property prices from listing details (location, area,
floor, bathrooms, furnishing, etc.) using a scikit-learn regression model served by a
FastAPI backend and consumed by a React + TypeScript frontend.

## Overview

The project has three parts:

1. **`notebooks/`** — a Jupyter notebook that loads the raw
   [House Price dataset](https://www.kaggle.com/datasets/juhibhojani/house-price)
   (~187k Indian property listings from Kaggle), cleans it, engineers features, trains
   and compares three regression models, and exports the winning model as
   `house_price.pkl`.
2. **`backend/`** — a FastAPI service that loads `house_price.pkl` once at startup and
   exposes `POST /predict` and `GET /health`.
3. **`frontend/`** — a React + TypeScript + Vite single-page app where a user fills in
   property details and sees the predicted price.

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌───────────────────────┐
│  React frontend  │  HTTP  │  FastAPI backend  │  load  │  house_price.pkl       │
│  (Vite, :5173)   │ ─────► │  (:8000)          │ ─────► │  (sklearn Pipeline +   │
│  PredictionForm  │ ◄───── │  /predict /health  │        │  TransformedTargetReg) │
└─────────────────┘  JSON   └──────────────────┘        └───────────────────────┘
                                                                     ▲
                                                                     │ joblib.dump
                                                          ┌──────────────────────┐
                                                          │  Jupyter notebook      │
                                                          │  clean → train → export│
                                                          └──────────────────────┘
```

## Tech stack

| Layer      | Tech |
|------------|------|
| Modeling   | Python, pandas, scikit-learn, joblib, matplotlib/seaborn |
| Backend    | FastAPI, Pydantic v2, uvicorn, pytest |
| Frontend   | React 18, TypeScript, Vite, react-router-dom |

## Project structure

```
house-price-project/
├── notebooks/
│   ├── data/                    # place house_prices.csv here (not committed)
│   ├── house_price_model.ipynb  # cleaning, EDA, training, export
│   └── target_transform.py      # shared log1p/expm1 transform (also copied to backend/)
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app, CORS, model loaded at startup (lifespan)
│   │   ├── api/routes/prediction.py   # GET /health, POST /predict
│   │   ├── core/config.py             # Settings from .env (pydantic-settings)
│   │   ├── schemas/prediction.py      # PredictionRequest / PredictionResponse
│   │   ├── services/
│   │   │   ├── preprocessing.py       # Turn a request into a one-row DataFrame
│   │   │   └── inference.py           # Load .pkl, run predict
│   │   └── utils/logging_config.py
│   ├── target_transform.py      # must match notebooks/target_transform.py (see note below)
│   ├── models/
│   │   ├── house_price.pkl      # copied from the notebook
│   │   └── locations.json       # allowed locations, for the frontend dropdown
│   ├── tests/test_prediction.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── api/predictionClient.ts   # fetch wrapper, base URL from VITE_API_BASE_URL
    │   ├── components/PredictionForm.tsx
    │   ├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
    │   ├── types/prediction.ts       # TS types mirroring the backend schema
    │   └── App.tsx                   # routes: / , /result , * (404)
    ├── public/locations.json         # copied from the notebook, populates the dropdown
    └── .env.example
```

> **Why `target_transform.py` is duplicated.** The exported model is a
> `TransformedTargetRegressor` that trains on `log1p(price)` and inverts predictions
> with a clipped `expm1`. Those two functions have to be importable under the same
> module name both when the model is *pickled* (in `notebooks/`) and when it's
> *unpickled* (in `backend/`), so the file is copied rather than shared via a package.
> If you retrain the model, re-copy the file too.

## Dataset

**House Price** by Juhi Bhojani —
https://www.kaggle.com/datasets/juhibhojani/house-price

~187,000 real property listings from India with columns including `Title`,
`Description`, `Amount(in rupees)`, `location`, `Carpet Area`, `Floor`, `Transaction`,
`Furnishing`, `facing`, `Bathroom`, `Balcony`, `Ownership`, `Super Area`, and more.

**Download it:**

- **Option A — manual:** click *Download* on the dataset page, unzip, and place
  `house_prices.csv` in `notebooks/data/`.
- **Option B — Kaggle CLI:**
  ```bash
  pip install kaggle
  # Get your API token: Kaggle → Settings → API → "Create New Token"
  # Place kaggle.json in ~/.kaggle/ (macOS/Linux) or C:\Users\<you>\.kaggle\ (Windows)
  kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip
  ```
  Then rename the extracted CSV to `house_prices.csv` if needed.

## Setup — Notebook

```bash
cd notebooks
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install jupyter pandas numpy scikit-learn matplotlib seaborn joblib

jupyter notebook house_price_model.ipynb
# Kernel → Restart & Run All
```

Running the notebook end-to-end regenerates `house_price.pkl` and `locations.json` in
`notebooks/`. Copy both into `backend/models/`, and copy `locations.json` into
`frontend/public/` as well, before running the backend/frontend.

> **Performance note.** The reference environment this was built in has a single CPU
> core, so the notebook trains on a random 60,000-row subsample of the ~174k cleaned
> rows (full cleaning still runs on all rows). On a normal multi-core machine you can
> raise or remove `SAMPLE_SIZE` in §2.3 for a model trained on more data.

## Setup — Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# make sure backend/models/house_price.pkl and backend/models/locations.json exist
# (copy them from notebooks/ if you retrained)

uvicorn app.main:app --reload
# open http://localhost:8000/docs and test /predict from Swagger UI
```

Run the tests:

```bash
pytest
```

### Environment variables (backend `.env`)

| Variable          | Default                      | Description                              |
|-------------------|-------------------------------|-------------------------------------------|
| `MODEL_PATH`      | `models/house_price.pkl`      | Path to the exported model pickle         |
| `LOCATIONS_PATH`  | `models/locations.json`       | Path to the allowed-locations list        |
| `CORS_ORIGINS`    | `["http://localhost:5173"]`   | Origins allowed to call the API           |

## Setup — Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# open http://localhost:5173
```

### Environment variables (frontend `.env`)

| Variable               | Default                  | Description                  |
|-------------------------|---------------------------|-------------------------------|
| `VITE_API_BASE_URL`     | `http://localhost:8000`   | Base URL of the FastAPI backend |

Build for production:

```bash
npm run build
```

## API reference

### `GET /health`

```json
{ "status": "ok" }
```

### `POST /predict`

Request body:

```json
{
  "location": "thane",
  "carpet_area_sqft": 650,
  "floor_num": 3,
  "bathroom": 2,
  "balcony": 1,
  "furnishing": "Semi-Furnished",
  "transaction": "Resale",
  "ownership": "Freehold",
  "facing": "East"
}
```

Response:

```json
{ "predicted_price": 6048318.78 }
```

curl example:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "thane",
    "carpet_area_sqft": 650,
    "floor_num": 3,
    "bathroom": 2,
    "balcony": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East"
  }'
```

Unknown locations (not in the top-50 seen during training) are automatically mapped to
`"other"` — no error, just a less location-specific prediction.

## Model metrics

Three models were trained on `log1p(price)` and compared on the held-out test set
(20% split, 60,000-row training sample):

| Model              | MAE (₹)     | RMSE (₹)    | R²     |
|---------------------|------------:|------------:|-------:|
| **Random Forest** (winner) | 1,142,248 | 4,223,925 | **0.881** |
| Gradient Boosting    | 2,892,555  | 6,100,689  | 0.752  |
| Linear Regression    | 3,840,175  | 9,894,528  | 0.347  |

Random Forest was exported as `house_price.pkl` — it captures the non-linear
interactions between location, area, and amenities far better than the linear
baseline, without the shorter, shallower trees that limited the Gradient Boosting run.
A 5-fold cross-validation of the winning model is included in the notebook (§2.5).

## Screenshots

_Add screenshots of the running app here (home form + result page) after you run it
locally — e.g. `docs/screenshot-home.png`, `docs/screenshot-result.png`._

## Publishing to GitHub

```bash
git init
git add .
git commit -m "House price prediction: notebook, FastAPI backend, React frontend"
git branch -M main
git remote add origin https://github.com/<your-username>/house-price-app.git
git push -u origin main
```

Remember: `.gitignore` already excludes `.venv/`, `node_modules/`, `dist/`, `.env`,
`*.log`, and the raw dataset CSV. `house_price.pkl` (≈24 MB) is small enough to commit.
