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
            console.error(e);
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
