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
        setError("Failed to load cinemas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cities = [...new Set(cinemas.map(t => t.city))].sort();
  const filtered = city === "all" ? cinemas : cinemas.filter(t => t.city === city);
  const getStatus = (s) => match(s) { case 'open' => 'Open', case 'closed' => 'Closed', case 'under_construction' => 'Under Construction', default => s }
  const getColor = (s) => `status-${s === 'open' ? 'open' : s === 'closed' ? 'closed' : 'construction'}`;

  if (loading) return <div className="page cinemas-page"><div className="loading-container"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page cinemas-page">
      <div className="cinemas-header">
        <h1>Our Cinemas</h1>
        <p>{filtered.length} {filtered.length === 1 ? "cinema" : "cinemas"}</p>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="cinemas-filter">
        <label htmlFor="city-filter">📍 Filter by City</label>
        <select id="city-filter" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="cinemas-grid">
        {filtered.map(c => (
          <Link key={c.cinema_id} to={`/cinemas/${c.cinema_id}`} className="cinema-card">
            <h3>{c.name}</h3>
            <p>{c.city}</p>
            <div className={`status ${getColor(c.status)}`}>{getStatus(c.status)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Cinemas;
          </select>
        </div>
      </div>

      {/* Cinemas Grid */}
      {filteredCinemas.length === 0 ? (
        <div className="no-cinemas">
          <p>No cinemas found in this city.</p>
        </div>
      ) : (
        <div className="cinemas-grid">
          {filteredCinemas.map((cinema) => (
            <div key={cinema.cinema_id} className="cinema-card">
              <div className="cinema-header">
                <h3 className="cinema-name">{cinema.name}</h3>
                <span className={`cinema-status ${getStatusColor(cinema.status)}`}>
                  {getStatusLabel(cinema.status)}
                </span>
              </div>

              <div className="cinema-info">
                <div className="info-item">
                  <span className="icon">📍</span>
                  <div className="info-content">
                    <p className="address">{cinema.address}</p>
                    <p className="location">{cinema.city}, {cinema.state || cinema.country}</p>
                    {cinema.postal_code && (
                      <p className="postal">{cinema.postal_code}</p>
                    )}
                  </div>
                </div>

                {cinema.phone && (
                  <div className="info-item">
                    <span className="icon">📞</span>
                    <div className="info-content">
                      <a href={`tel:${cinema.phone}`} className="contact-link">
                        {cinema.phone}
                      </a>
                    </div>
                  </div>
                )}

                {cinema.email && (
                  <div className="info-item">
                    <span className="icon">📧</span>
                    <div className="info-content">
                      <a href={`mailto:${cinema.email}`} className="contact-link">
                        {cinema.email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="cinema-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🎬</span>
                    <div className="stat-content">
                      <span className="stat-value">{cinema.total_screens}</span>
                      <span className="stat-label">Screens</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <span className="stat-icon">💺</span>
                    <div className="stat-content">
                      <span className="stat-value">{cinema.total_seats}</span>
                      <span className="stat-label">Total Seats</span>
                    </div>
                  </div>
                </div>

                {cinema.amenities && (
                  <div className="cinema-amenities">
                    <h4>Amenities</h4>
                    <div className="amenities-list">
                      {cinema.amenities.split(',').map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {amenity.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="cinema-actions">
                <Link 
                  to={`/showtimes?cinema=${cinema.cinema_id}`} 
                  className="btn-view-showtimes"
                >
                  View Showtimes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cinemas;