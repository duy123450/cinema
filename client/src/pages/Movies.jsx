import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Link, useSearchParams } from "react-router-dom";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, now_showing, upcoming, ended
  const [sortBy, setSortBy] = useState("id"); // id, title, release_date, imdb_rating
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        if (searchQuery) {
          // If there's a search query, use search API
          const data = await apiService.searchMovies(searchQuery);
          setMovies(data);
        } else {
          // Otherwise, get all movies
          const data = await apiService.getMovies(null);
          setMovies(data);
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchQuery]);

  // Filter movies based on selected status
  const filteredMovies = movies.filter((movie) => {
    if (filter === "all") return true;
    return movie.status === filter;
  });

  // Sort movies based on selected criteria
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "release_date":
        aValue = new Date(a.release_date || "1900-01-01");
        bValue = new Date(b.release_date || "1900-01-01");
        break;
      case "imdb_rating":
        aValue = parseFloat(a.imdb_rating || 0);
        bValue = parseFloat(b.imdb_rating || 0);
        break;
      case "id":
      default:
        aValue = a.movie_id;
        bValue = b.movie_id;
        break;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same sort button
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort by and default to ascending
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

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

  const getSortIcon = (field) => {
    if (sortBy !== field) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
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
        {searchQuery && (
          <p className="search-query-display">
            Search results for: <strong>"{searchQuery}"</strong>
          </p>
        )}
        <p className="movies-subtitle">
          {sortedMovies.length} {sortedMovies.length === 1 ? "movie" : "movies"}{" "}
          found
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

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

      {/* Sort Buttons */}
      <div className="movies-sort">
        <span className="sort-label">Sort by:</span>
        <button
          className={`sort-btn ${sortBy === "id" ? "active" : ""}`}
          onClick={() => handleSortChange("id")}
        >
          Default {getSortIcon("id")}
        </button>
        <button
          className={`sort-btn ${sortBy === "title" ? "active" : ""}`}
          onClick={() => handleSortChange("title")}
        >
          Title {getSortIcon("title")}
        </button>
        <button
          className={`sort-btn ${sortBy === "release_date" ? "active" : ""}`}
          onClick={() => handleSortChange("release_date")}
        >
          Release Date {getSortIcon("release_date")}
        </button>
        <button
          className={`sort-btn ${sortBy === "imdb_rating" ? "active" : ""}`}
          onClick={() => handleSortChange("imdb_rating")}
        >
          IMDB Rating {getSortIcon("imdb_rating")}
        </button>
      </div>

      {sortedMovies.length === 0 ? (
        <div className="no-movies">
          <p>
            {searchQuery
              ? `No movies found matching "${searchQuery}".`
              : "No movies found in this category."}
          </p>
          {searchQuery && (
            <Link to="/movies" className="btn-back">
              Clear Search
            </Link>
          )}
        </div>
      ) : (
        <div className="movie-grid">
          {sortedMovies.map((movie) => (
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

                <div className="movie-meta">
                  {movie.release_date && (
                    <span className="meta-item">
                      📅 {new Date(movie.release_date).toLocaleDateString()}
                    </span>
                  )}
                  {movie.duration_minutes && (
                    <span className="meta-item">
                      ⏱️ {movie.duration_minutes} min
                    </span>
                  )}
                </div>

                {movie.rating && (
                  <div className="movie-rating-badge">
                    <span className="rating-badge">{movie.rating}</span>
                  </div>
                )}

                {movie.description && (
                  <p className="movie-description">
                    {movie.description.substring(0, 120)}...
                  </p>
                )}

                <Link
                  to={`/movies/${movie.movie_id}`}
                  className="btn-view-details"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Movies;
