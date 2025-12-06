import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getMovieById(id);
        console.log('Movie data:', data); // Debug log
        setMovie(data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to load movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetail();
    }
  }, [id]);

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
      <div className="page movie-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page movie-detail-page">
        <div className="error-container">
          <h2>Movie Not Found</h2>
          <p>{error || "The movie you're looking for doesn't exist."}</p>
          <Link to="/movies" className="btn-back">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page movie-detail-page">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Back
      </button>

      <div className="movie-detail-container">
        {/* Movie Poster Section */}
        <div className="movie-poster-section">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={movie.title} className="movie-poster-large" />
          ) : (
            <div className="poster-placeholder-large">
              <span>🎬</span>
            </div>
          )}
          <div className={`movie-status-badge ${getStatusColor(movie.status)}`}>
            {getStatusLabel(movie.status)}
          </div>
        </div>

        {/* Movie Info Section */}
        <div className="movie-info-section">
          <h1 className="movie-detail-title">{movie.title}</h1>

          {movie.original_title && movie.original_title !== movie.title && (
            <p className="movie-original-title">{movie.original_title}</p>
          )}

          {/* Rating Badge */}
          {movie.rating && (
            <div className="movie-rating-badge">
              <span className="rating-badge">{movie.rating}</span>
            </div>
          )}

          {/* Movie Meta Info */}
          <div className="movie-meta-grid">
            {movie.release_date && (
              <div className="meta-item">
                <span className="meta-label">Release Date</span>
                <span className="meta-value">
                  📅 {new Date(movie.release_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {movie.duration_minutes && (
              <div className="meta-item">
                <span className="meta-label">Duration</span>
                <span className="meta-value">⏱️ {movie.duration_minutes} minutes</span>
              </div>
            )}

            {movie.genre && (
              <div className="meta-item">
                <span className="meta-label">Genre</span>
                <span className="meta-value">🎭 {movie.genre}</span>
              </div>
            )}

            {movie.director && (
              <div className="meta-item">
                <span className="meta-label">Director</span>
                <span className="meta-value">🎬 {movie.director}</span>
              </div>
            )}

            {movie.language && (
              <div className="meta-item">
                <span className="meta-label">Language</span>
                <span className="meta-value">🌐 {movie.language}</span>
              </div>
            )}

            {movie.imdb_rating && (
              <div className="meta-item">
                <span className="meta-label">IMDB Rating</span>
                <span className="meta-value imdb-score">⭐ {movie.imdb_rating}/10</span>
              </div>
            )}
          </div>

          {/* Cast List */}
          {movie.cast_list && (
            <div className="movie-cast-section">
              <h3 className="section-title">Cast</h3>
              <p className="cast-list">🎭 {movie.cast_list}</p>
            </div>
          )}

          {/* Description */}
          {movie.description && (
            <div className="movie-description-section">
              <h3 className="section-title">Synopsis</h3>
              <p className="movie-description-full">{movie.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="movie-actions">
            <Link to="/showtimes" className="btn-showtimes">
              View Showtimes
            </Link>
            <Link to="/bookings" className="btn-book-tickets">
              Book Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;