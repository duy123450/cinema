import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import useClickOutside from "../hooks/useClickOutside";

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(searchRef, () => setShowResults(false));

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const performSearch = async (query) => {
    try {
      setIsSearching(true);
      const results = await apiService.searchMovies(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (movieId) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    navigate(`/movies/${movieId}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowResults(false);
      navigate(`/movies?search=${encodeURIComponent(searchQuery)}`);
    }
  };

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

  return (
    <div className="search-bar" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search movies, actors, genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              setShowResults(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {showResults && (
        <div className="search-results">
          {isSearching ? (
            <div className="search-loading">
              <div className="spinner-small"></div>
              <span>Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="search-results-header">
                <span>Found {searchResults.length} results</span>
              </div>
              <div className="search-results-list">
                {searchResults.map((movie) => (
                  <div
                    key={movie.movie_id}
                    className="search-result-item"
                    onClick={() => handleResultClick(movie.movie_id)}
                  >
                    <div className="result-poster">
                      {movie.poster_url ? (
                        <img src={movie.poster_url} alt={movie.title} />
                      ) : (
                        <div className="result-poster-placeholder">🎬</div>
                      )}
                    </div>
                    <div className="result-info">
                      <h4 className="result-title">{movie.title}</h4>
                      <div className="result-meta">
                        {movie.release_date && (
                          <span className="result-year">
                            {new Date(movie.release_date).getFullYear()}
                          </span>
                        )}
                        {movie.genre && (
                          <span className="result-genre">• {movie.genre}</span>
                        )}
                      </div>
                      <span className={`result-status ${getStatusColor(movie.status)}`}>
                        {getStatusLabel(movie.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="search-results-footer">
                <button
                  className="view-all-results"
                  onClick={() => {
                    setShowResults(false);
                    navigate(`/movies?search=${encodeURIComponent(searchQuery)}`);
                  }}
                >
                  View All Results →
                </button>
              </div>
            </>
          ) : (
            <div className="search-no-results">
              <span>No movies found for "{searchQuery}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;