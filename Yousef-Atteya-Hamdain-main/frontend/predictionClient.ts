import { useEffect, useState } from "react";
import type { PredictionRequest } from "../types/prediction";

interface Props {
  onSubmit: (data: PredictionRequest) => void;
  loading: boolean;
}

const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"] as const;
const TRANSACTION_OPTIONS = ["New Property", "Resale"] as const;
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative Society", "Power Of Attorney", "Unknown"];
const FACING_OPTIONS = ["East", "West", "North", "South", "North - East", "North - West", "South - East", "South - West", "Unknown"];

const initialState: PredictionRequest = {
  location: "",
  carpet_area_sqft: 0,
  floor_num: 0,
  bathroom: 1,
  balcony: 0,
  furnishing: "Unfurnished",
  transaction: "Resale",
  ownership: "Unknown",
  facing: "Unknown",
};

export default function PredictionForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<PredictionRequest>(initialState);
  const [locations, setLocations] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/locations.json")
      .then((res) => res.json())
      .then((data: string[]) => setLocations(data))
      .catch(() => setLocations([]));
  }, []);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.location) next.location = "Please choose a location.";
    if (!form.carpet_area_sqft || form.carpet_area_sqft <= 0) next.carpet_area_sqft = "Area must be greater than 0.";
    if (form.bathroom < 0) next.bathroom = "Bathrooms can't be negative.";
    if (form.balcony < 0) next.balcony = "Balconies can't be negative.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  function update<K extends keyof PredictionRequest>(key: K, value: PredictionRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      <div className="field">
        <label htmlFor="location">Location</label>
        <select
          id="location"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
        >
          <option value="">Select a location…</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        {errors.location && <span className="error">{errors.location}</span>}
      </div>

      <div className="field">
        <label htmlFor="carpet_area_sqft">Carpet area (sqft)</label>
        <input
          id="carpet_area_sqft"
          type="number"
          min={1}
          value={form.carpet_area_sqft || ""}
          onChange={(e) => update("carpet_area_sqft", Number(e.target.value))}
        />
        {errors.carpet_area_sqft && <span className="error">{errors.carpet_area_sqft}</span>}
      </div>

      <div className="field">
        <label htmlFor="floor_num">Floor number</label>
        <input
          id="floor_num"
          type="number"
          value={form.floor_num}
          onChange={(e) => update("floor_num", Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label htmlFor="bathroom">Bathrooms</label>
        <input
          id="bathroom"
          type="number"
          min={0}
          value={form.bathroom}
          onChange={(e) => update("bathroom", Number(e.target.value))}
        />
        {errors.bathroom && <span className="error">{errors.bathroom}</span>}
      </div>

      <div className="field">
        <label htmlFor="balcony">Balconies</label>
        <input
          id="balcony"
          type="number"
          min={0}
          value={form.balcony}
          onChange={(e) => update("balcony", Number(e.target.value))}
        />
        {errors.balcony && <span className="error">{errors.balcony}</span>}
      </div>

      <div className="field">
        <label htmlFor="furnishing">Furnishing</label>
        <select id="furnishing" value={form.furnishing} onChange={(e) => update("furnishing", e.target.value as PredictionRequest["furnishing"])}>
          {FURNISHING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="transaction">Transaction</label>
        <select id="transaction" value={form.transaction} onChange={(e) => update("transaction", e.target.value as PredictionRequest["transaction"])}>
          {TRANSACTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ownership">Ownership</label>
        <select id="ownership" value={form.ownership} onChange={(e) => update("ownership", e.target.value)}>
          {OWNERSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="facing">Facing</label>
        <select id="facing" value={form.facing} onChange={(e) => update("facing", e.target.value)}>
          {FACING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Predicting…" : "Predict price"}
      </button>
    </form>
  );
}
