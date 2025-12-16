import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import { apiService } from "../services/api";

function Index() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both now playing and upcoming movies
        const [nowPlaying, upcoming] = await Promise.all([
          apiService.getMovies('now_showing'),
          apiService.getMovies('upcoming')
        ]);

        // ✅ CRITICAL FIX: Ensure data is always an array
        setNowPlayingMovies(Array.isArray(nowPlaying) ? nowPlaying.slice(0, 8) : []);
        setUpcomingMovies(Array.isArray(upcoming) ? upcoming.slice(0, 8) : []);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies");
        // ✅ Set empty arrays on error to prevent map errors
        setNowPlayingMovies([]);
        setUpcomingMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const MovieCard = ({ movie }) => (
    <Link to={`/movies/${movie.movie_id}`} className="movie-card">
      <div className="movie-poster">
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={movie.title} />
        ) : (
          <div className="poster-placeholder">
            <span>🎬</span>
          </div>
        )}
        <div className="movie-overlay">
          <span className="view-details">View Details</span>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          {movie.duration_minutes && (
            <span className="duration">⏱️ {movie.duration_minutes} min</span>
          )}
          {movie.rating && (
            <span className="rating-badge">{movie.rating}</span>
          )}
        </div>
        {movie.genre && (
          <p className="movie-genre">🎭 {movie.genre}</p>
        )}
      </div>
    </Link>
  );

  return (
    <div className="dashboard-page">
      <Banner />

      {/* Now Playing Section */}
      <section className="now-playing">
        <div className="section-header">
          <h2>Now Playing</h2>
          <Link to="/movies?filter=now_showing" className="see-all-link">
            See All →
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading movies...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : nowPlayingMovies.length > 0 ? (
          <div className="movies-grid">
            {nowPlayingMovies.map((movie) => (
              <MovieCard key={movie.movie_id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="no-movies">
            <p>No movies currently showing</p>
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      <section className="coming-soon">
        <div className="section-header">
          <h2>Coming Soon</h2>
          <Link to="/movies?filter=upcoming" className="see-all-link">
            See All →
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading upcoming movies...</p>
          </div>
        ) : upcomingMovies.length > 0 ? (
          <div className="movies-grid">
            {upcomingMovies.map((movie) => (
              <MovieCard key={movie.movie_id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="no-movies">
            <p>No upcoming movies</p>
          </div>
        )}
      </section>

      {/* Quick Actions Section */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/movies" className="action-card">
            <div className="action-icon">🎬</div>
            <h3>Browse Movies</h3>
            <p>Explore our full collection</p>
          </Link>
          
          <Link to="/showtimes" className="action-card">
            <div className="action-icon">🕒</div>
            <h3>Showtimes</h3>
            <p>Check movie schedules</p>
          </Link>
          
          <Link to="/cinemas" className="action-card">
            <div className="action-icon">🏢</div>
            <h3>Cinemas</h3>
            <p>Find theaters near you</p>
          </Link>
          
          <Link to="/buy-tickets" className="action-card">
            <div className="action-icon">🎟️</div>
            <h3>Buy Tickets</h3>
            <p>Book your seats now</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Index;