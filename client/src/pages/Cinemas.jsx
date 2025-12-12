import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";

function Cinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setCinemas(await apiService.getCinemas());
      } catch (err) {
        console.error(err);
        setError("Failed to load cinemas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cities = [...new Set(cinemas.map((t) => t.city))].sort();
  const filtered =
    city === "all" ? cinemas : cinemas.filter((t) => t.city === city);
  const getStatus = (s) =>
    ({
      open: "Open",
      closed: "Closed",
      under_construction: "Under Construction",
    }[s] || s);
  const getColor = (s) =>
    `status-${
      s === "open" ? "open" : s === "closed" ? "closed" : "construction"
    }`;

  if (loading)
    return (
      <div className="page cinemas-page" >
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="page cinemas-page">
      <div className="cinemas-header">
        <h1>Our Cinemas</h1>
        <p>
          {filtered.length} {filtered.length === 1 ? "cinema" : "cinemas"}
        </p>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="cinemas-filter">
        <label htmlFor="city-filter">📍 Filter by City</label>
        <select
          id="city-filter"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="all">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="cinemas-grid">
        {filtered.map((c) => (
          <Link
            key={c.cinema_id}
            to={`/cinemas/${c.cinema_id}`}
            className="cinema-card"
          >
            <h3>{c.name}</h3>
            <p>{c.city}</p>
            <div className={`status ${getColor(c.status)}`}>
              {getStatus(c.status)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Cinemas;
