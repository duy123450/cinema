import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";

function Cinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getCinemas();
        setCinemas(data);
      } catch (err) {
        console.error("Error fetching cinemas:", err);
        setError("Failed to load cinemas. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  // Get unique cities
  const cities = [...new Set(cinemas.map(t => t.city))].sort();

  // Filter cinemas by city
  const filteredCinemas = selectedCity === "all" 
    ? cinemas 
    : cinemas.filter(t => t.city === selectedCity);

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "status-open";
      case "closed":
        return "status-closed";
      case "under_construction":
        return "status-construction";
      default:
        return "status-default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Open";
      case "closed":
        return "Closed";
      case "under_construction":
        return "Under Construction";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="page cinemas-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cinemas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page cinemas-page">
      <div className="cinemas-header">
        <h1>Our Cinemas</h1>
        <p className="cinemas-subtitle">
          {filteredCinemas.length} {filteredCinemas.length === 1 ? "cinema" : "cinemas"} available
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* City Filter */}
      <div className="cinemas-filter">
        <div className="filter-group">
          <label htmlFor="city-filter">📍 Filter by City</label>
          <select
            id="city-filter"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
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