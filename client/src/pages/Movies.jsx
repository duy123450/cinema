import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getMovies();

        // ✅ Add safety check to ensure data is an array
        if (Array.isArray(data)) {
          setMovies(data);
        } else {
          console.error("API returned non-array data:", data);
          setMovies([]);
          setError("Invalid data format received from server");
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again later.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // ✅ Add safety check before filtering
  const filteredMovies = Array.isArray(movies)
    ? movies.filter((movie) => {
        if (filter === "all") return true;
        return movie.status === filter;
      })
    : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "now_showing":
        return "status-now-showing";
      case "upcoming":
        return "status-upcoming";
      case "ended":
        return "status-ended";
      default:
        return "status-default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "now_showing":
        return "Now Showing";
      case "upcoming":
        return "Coming Soon";
      case "ended":
        return "Ended";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="page movies-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page movies-page">
      <div className="movies-header">
        <h1>Movies</h1>
        <p className="movies-subtitle">
          {filteredMovies.length}{" "}
          {filteredMovies.length === 1 ? "movie" : "movies"} found
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="movies-filter">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Movies ({movies.length})
        </button>
        <button
          className={`filter-btn ${filter === "now_showing" ? "active" : ""}`}
          onClick={() => setFilter("now_showing")}
        >
          Now Showing ({movies.filter((m) => m.status === "now_showing").length}
          )
        </button>
        <button
          className={`filter-btn ${filter === "upcoming" ? "active" : ""}`}
          onClick={() => setFilter("upcoming")}
        >
          Coming Soon ({movies.filter((m) => m.status === "upcoming").length})
        </button>
        <button
          className={`filter-btn ${filter === "ended" ? "active" : ""}`}
          onClick={() => setFilter("ended")}
        >
          Ended ({movies.filter((m) => m.status === "ended").length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredMovies.length === 0 ? (
        <div className="no-movies">
          <p>No movies found in this category.</p>
        </div>
      ) : (
        <div className="movie-grid">
          {filteredMovies.map((movie) => (
            <div key={movie.movie_id} className="movie-card">
              <div className="movie-poster">
                {movie.poster_url ? (
                  <img src={movie.poster_url} alt={movie.title} />
                ) : (
                  <div className="poster-placeholder">
                    <span>🎬</span>
                  </div>
                )}
                <div className={`movie-status ${getStatusColor(movie.status)}`}>
                  {getStatusLabel(movie.status)}
                </div>
              </div>

              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>

                {movie.original_title &&
                  movie.original_title !== movie.title && (
                    <p className="movie-original-title">
                      {movie.original_title}
                    </p>
                  )}

                <div className="movie-meta">
                  {movie.release_date && (
                    <span className="meta-item">
                      <strong>Release:</strong>{" "}
                      {new Date(movie.release_date).toLocaleDateString()}
                    </span>
                  )}
                  {movie.duration_minutes && (
                    <span className="meta-item">
                      <strong>Duration:</strong> {movie.duration_minutes} min
                    </span>
                  )}
                </div>

                {movie.genre && (
                  <p className="movie-genre">
                    <strong>Genre:</strong> {movie.genre}
                  </p>
                )}

                {movie.director && (
                  <p className="movie-director">
                    <strong>Director:</strong> {movie.director}
                  </p>
                )}

                {movie.rating && (
                  <p className="movie-rating">
                    <strong>Rating:</strong>{" "}
                    <span className="rating-badge">{movie.rating}</span>
                  </p>
                )}

                {movie.imdb_rating && (
                  <p className="movie-imdb">
                    <strong>IMDB:</strong>{" "}
                    <span className="imdb-score">
                      ⭐ {movie.imdb_rating}/10
                    </span>
                  </p>
                )}

                {movie.description && (
                  <p className="movie-description">
                    {movie.description.substring(0, 100)}...
                  </p>
                )}

                <div className="movie-actions">
                  <Link to="/showtimes" className="btn-showtimes">
                    View Showtimes
                  </Link>
                  <Link to="/bookings" className="btn-book">
                    Book Tickets
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Movies;
