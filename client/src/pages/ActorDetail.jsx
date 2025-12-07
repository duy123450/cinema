import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";

function ActorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actor, setActor] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActorDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch actor details and their movies
        const [actorData, moviesData] = await Promise.all([
          apiService.getActorById(id),
          apiService.getActorMovies(id)
        ]);

        setActor(actorData);
        setMovies(moviesData);
      } catch (err) {
        console.error("Error fetching actor details:", err);
        setError("Failed to load actor details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchActorDetail();
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "now_showing": return "status-now-showing";
      case "upcoming": return "status-upcoming";
      case "ended": return "status-ended";
      default: return "status-default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "now_showing": return "Now Showing";
      case "upcoming": return "Coming Soon";
      case "ended": return "Ended";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="page actor-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading actor details...</p>
        </div>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="page actor-detail-page">
        <div className="error-container">
          <h2>Actor Not Found</h2>
          <p>{error || "The actor you're looking for doesn't exist."}</p>
          <Link to="/movies" className="btn-back">Back to Movies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page actor-detail-page">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Back
      </button>

      <div className="actor-detail-container">
        {/* Actor Profile Section */}
        <div className="actor-profile-section">
          {actor.image_url ? (
            <img src={actor.image_url} alt={actor.name} className="actor-image-large" />
          ) : (
            <div className="actor-image-placeholder-large">
              <span>👤</span>
            </div>
          )}
          
          <div className="actor-stats">
            <div className="stat-item">
              <span className="stat-value">{movies.length}</span>
              <span className="stat-label">Movies</span>
            </div>
          </div>
        </div>

        {/* Actor Info Section */}
        <div className="actor-info-section">
          <h1 className="actor-name">{actor.name}</h1>

          {/* Bio Section */}
          {actor.bio && (
            <div className="actor-bio-section">
              <h3 className="section-title">Biography</h3>
              <p className="actor-bio">{actor.bio}</p>
            </div>
          )}

          {/* Movies Section */}
          {movies.length > 0 && (
            <div className="actor-movies-section">
              <h3 className="section-title">Filmography ({movies.length})</h3>
              
              <div className="movies-grid">
                {movies.map((movie) => (
                  <Link 
                    key={movie.movie_id} 
                    to={`/movies/${movie.movie_id}`}
                    className="movie-card-small"
                  >
                    <div className="movie-poster-small">
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
                    
                    <div className="movie-info-small">
                      <h4 className="movie-title-small">{movie.title}</h4>
                      <p className="character-name">as {movie.character_name}</p>
                      
                      <div className="movie-meta-small">
                        {movie.release_date && (
                          <span className="release-year">
                            📅 {new Date(movie.release_date).getFullYear()}
                          </span>
                        )}
                        {movie.role_type && (
                          <span className={`role-badge role-${movie.role_type}`}>
                            {movie.role_type}
                          </span>
                        )}
                      </div>

                      {movie.genre && (
                        <p className="movie-genre">🎭 {movie.genre}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {movies.length === 0 && (
            <div className="no-movies">
              <p>No movies found for this actor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActorDetail;