import { Link, useLocation, Navigate } from "react-router-dom";

function formatIndianPrice(amount: number): string {
  if (amount >= 1e7) return `₹ ${(amount / 1e7).toFixed(2)} Cr`;
  if (amount >= 1e5) return `₹ ${(amount / 1e5).toFixed(2)} Lac`;
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

export default function ResultPage() {
  const location = useLocation();
  const state = location.state as { price: number; input: Record<string, unknown> } | null;

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { price, input } = state;

  return (
    <main className="page">
      <h1>Predicted price</h1>
      <p className="predicted-price">{formatIndianPrice(price)}</p>

      <table className="summary-table">
        <tbody>
          {Object.entries(input).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/" className="back-link">
        ← Try another property
      </Link>
    </main>
  );
}
