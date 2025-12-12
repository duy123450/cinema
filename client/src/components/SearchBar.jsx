import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import useClickOutside from "../hooks/useClickOutside";

function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();

  useClickOutside(ref, () => setShow(false));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q.trim().length >= 2) {
        (async () => {
          try {
            const res = await apiService.searchMovies(q);
            setResults(res.slice(0, 5));
            setShow(true);
          } catch (e) {
            setResults([]);
          }
        })();
      } else {
        setResults([]);
        setShow(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const getStatus = (s) => ({
    now_showing: { label: "Now Showing", color: "status-now-showing" },
    upcoming: { label: "Coming Soon", color: "status-upcoming" },
    ended: { label: "Ended", color: "status-ended" }
  })[s] || { label: s, color: "status-default" };

  return (
    <div className="search-bar" ref={ref}>
      <input
        type="text"
        placeholder="Search movies..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && q.trim() && (setShow(false), nav(`/movies?search=${encodeURIComponent(q)}`))}
      />
      {show && results.length > 0 && (
        <div className="search-results">
          {results.map(m => {
            const st = getStatus(m.status);
            return (
              <div key={m.movie_id} onClick={() => (setQ(""), setResults([]), setShow(false), nav(`/movies/${m.movie_id}`))}>              <h4>{m.title}</h4>
              <span className={st.color}>{st.label}</span>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchBar;

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
                <span className="search-hint">Press Enter to see all</span>
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
              <p className="search-hint-text">Press Enter to search all content</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;