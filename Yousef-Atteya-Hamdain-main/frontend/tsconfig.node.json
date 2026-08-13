import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PredictionForm from "../components/PredictionForm";
import { predictPrice } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(data: PredictionRequest) {
    setLoading(true);
    setError(null);
    try {
      const result = await predictPrice(data);
      navigate("/result", { state: { price: result.predicted_price, input: data } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <h1>House Price Predictor</h1>
      <p className="subtitle">Enter the property details below to get an estimated price.</p>
      <PredictionForm onSubmit={handleSubmit} loading={loading} />
      {error && <p className="error banner">{error}</p>}
    </main>
  );
}
