import type { PredictionRequest, PredictionResponse } from "../types/prediction";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function predictPrice(payload: PredictionRequest): Promise<PredictionResponse> {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.detail ? JSON.stringify(body.detail) : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<PredictionResponse>;
}

export async function fetchHealth(): Promise<{ status: string }> {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) throw new Error("Backend is unreachable");
  return response.json();
}
