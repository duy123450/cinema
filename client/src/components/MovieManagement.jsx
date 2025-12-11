import { useState, useEffect } from "react";
import { apiService } from "../services/api";

function MovieManagement() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    original_title: "",
    description: "",
    duration_minutes: "",
    release_date: "",
    end_date: "",
    director: "",
    genre: "",
    language: "English",
    rating: "PG-13",
    imdb_rating: "",
    poster_url: "",
    status: "upcoming",
  });
  const [trailers, setTrailers] = useState([]);
  const [cast, setCast] = useState([]);
  const [actors, setActors] = useState([]);

  // Fetch movies on mount
  useEffect(() => {
    fetchMovies();
    fetchActors();
  }, []);

  const fetchActors = async () => {
    try {
      const res = await apiService.getActors();
      setActors(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error fetching actors:", err);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMovies();
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      original_title: "",
      description: "",
      duration_minutes: "",
      release_date: "",
      end_date: "",
      director: "",
      genre: "",
      language: "English",
      rating: "PG-13",
      imdb_rating: "",
      poster_url: "",
      status: "upcoming",
    });
    setEditingId(null);
    setShowAddForm(false);
    setTrailers([]);
    setCast([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.duration_minutes) {
      setError("Title and duration are required");
      return;
    }

    try {
      setError(null);

      const payload = { ...formData, trailers, cast };

      if (editingId) {
        // Update existing movie
        const response = await apiService.updateMovie(editingId, payload);
        if (response.success) {
          setMovies(
            movies.map((m) =>
              m.movie_id === editingId ? { ...m, ...formData } : m
            )
          );
          resetForm();
          setError("Movie updated successfully!");
          setTimeout(() => setError(null), 3000);
        } else {
          setError(response.message || "Failed to update movie");
        }
      } else {
        // Create new movie
        const response = await apiService.createMovie(payload);
        if (response.success) {
          const newMovie = {
            movie_id: response.movie_id,
            ...formData,
          };
          setMovies([newMovie, ...movies]);
          resetForm();
          setError("Movie created successfully!");
          setTimeout(() => setError(null), 3000);
        } else {
          setError(response.message || "Failed to create movie");
        }
      }
    } catch (err) {
      console.error("Error saving movie:", err);
      setError("Error saving movie: " + err.message);
    }
  };

  const handleEdit = (movie) => {
    (async () => {
      setFormData({
        title: movie.title,
        original_title: movie.original_title || "",
        description: movie.description || "",
        duration_minutes: movie.duration_minutes || "",
        release_date: movie.release_date || "",
        end_date: movie.end_date || "",
        director: movie.director || "",
        genre: movie.genre || "",
        language: movie.language || "English",
        rating: movie.rating || "PG-13",
        imdb_rating: movie.imdb_rating || "",
        poster_url: movie.poster_url || "",
        status: movie.status || "upcoming",
      });
      setEditingId(movie.movie_id);
      setShowAddForm(true);

      // fetch trailers and cast for the movie
      try {
        const [trs, cs] = await Promise.all([
          apiService.getMovieTrailers(movie.movie_id),
          apiService.getMovieCast(movie.movie_id),
        ]);
        setTrailers(Array.isArray(trs) ? trs : []);
        setCast(Array.isArray(cs) ? cs : []);
      } catch (err) {
        console.error("Error fetching trailers/cast:", err);
        setTrailers([]);
        setCast([]);
      }
    })();
  };

  // Trailer management
  const addTrailer = () => {
    setTrailers((prev) => [
      ...prev,
      {
        title: "",
        url: "",
        duration_seconds: "",
        trailer_type: "official",
        language: "",
        is_featured: 0,
        views: 0,
      },
    ]);
  };

  const updateTrailer = (index, field, value) => {
    setTrailers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeTrailer = (index) => {
    setTrailers((prev) => prev.filter((_, i) => i !== index));
  };

  // Cast management
  const addCastMember = () => {
    setCast((prev) => [
      ...prev,
      {
        actor_id: null,
        character_name: "",
        role_type: "supporting",
        cast_order: null,
      },
    ]);
  };

  const updateCast = (index, field, value) => {
    setCast((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeCast = (index) => {
    setCast((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (movieId) => {
    try {
      setError(null);
      const response = await apiService.deleteMovie(movieId);
      if (response.success) {
        setMovies(movies.filter((m) => m.movie_id !== movieId));
        setDeletingId(null);
        setError("Movie deleted successfully!");
        setTimeout(() => setError(null), 3000);
      } else {
        setError(response.message || "Failed to delete movie");
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
      setError("Error deleting movie: " + err.message);
    }
  };

  // Filter and search movies
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || movie.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="movie-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-management">
      {/* Error/Success Message */}
      {error && (
        <div
          className={`message ${
            error.includes("successfully") ? "success" : "error"
          }`}
        >
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mm-header">
        <h2>🎥 Movie Management System</h2>
        <button
          className="btn-add-movie"
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? "✕ Cancel" : "➕ Add New Movie"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="movie-form">
          <div className="form-header">
            <h3>{editingId ? "✏️ Edit Movie" : "➕ Add New Movie"}</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Movie title"
              />
            </div>

            <div className="form-group">
              <label>Original Title</label>
              <input
                type="text"
                name="original_title"
                value={formData.original_title}
                onChange={handleInputChange}
                placeholder="Original title"
              />
            </div>

            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                required
                placeholder="e.g., 120"
              />
            </div>

            <div className="form-group">
              <label>Release Date</label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                placeholder="Director name"
              />
            </div>

            <div className="form-group">
              <label>Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                placeholder="e.g., Action, Drama"
              />
            </div>

            <div className="form-group">
              <label>Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Vietnames">Tiếng Việt</option>
              </select>
            </div>

            <div className="form-group">
              <label>Rating</label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
              >
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="NC-17">NC-17</option>
              </select>
            </div>

            <div className="form-group">
              <label>IMDb Rating</label>
              <input
                type="number"
                name="imdb_rating"
                value={formData.imdb_rating}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                max="10"
                placeholder="e.g., 8.5"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="upcoming">Upcoming</option>
                <option value="now_showing">Now Showing</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div className="form-group">
              <label>Poster URL</label>
              <input
                type="url"
                name="poster_url"
                value={formData.poster_url}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Movie description..."
                rows="4"
              />
            </div>
          </div>

          {/* Trailers Section */}
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Trailers</label>
              <div className="trailers-list">
                {trailers.map((t, idx) => (
                  <div className="trailer-item" key={idx}>
                    <input
                      type="text"
                      placeholder="Trailer title"
                      value={t.title || ""}
                      onChange={(e) =>
                        updateTrailer(idx, "title", e.target.value)
                      }
                    />
                    <input
                      type="url"
                      placeholder="Trailer URL"
                      value={t.url || ""}
                      onChange={(e) =>
                        updateTrailer(idx, "url", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Duration (seconds)"
                      value={t.duration_seconds || ""}
                      onChange={(e) =>
                        updateTrailer(idx, "duration_seconds", e.target.value)
                      }
                    />
                    <select
                      value={t.trailer_type || "official"}
                      onChange={(e) =>
                        updateTrailer(idx, "trailer_type", e.target.value)
                      }
                    >
                      <option value="official">Official</option>
                      <option value="behind_the_scenes">
                        Behind the Scenes
                      </option>
                    </select>
                    <input
                      type="text"
                      placeholder="Language"
                      value={t.language || ""}
                      onChange={(e) =>
                        updateTrailer(idx, "language", e.target.value)
                      }
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={!!t.is_featured}
                        onChange={(e) =>
                          updateTrailer(
                            idx,
                            "is_featured",
                            e.target.checked ? 1 : 0
                          )
                        }
                      />{" "}
                      Featured
                    </label>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => removeTrailer(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-add-movie"
                  onClick={addTrailer}
                >
                  Add Trailer
                </button>
              </div>
            </div>
          </div>

          {/* Cast Section */}
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Cast</label>
              <div className="cast-list">
                {cast.map((c, idx) => (
                  <div className="cast-item" key={idx}>
                    <select
                      value={c.actor_id || ""}
                      onChange={(e) =>
                        updateCast(idx, "actor_id", e.target.value || null)
                      }
                    >
                      <option value="">Select Actor (or leave blank)</option>
                      {actors.map((a) => (
                        <option key={a.actor_id} value={a.actor_id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Character name"
                      value={c.character_name || ""}
                      onChange={(e) =>
                        updateCast(idx, "character_name", e.target.value)
                      }
                    />
                    <select
                      value={c.role_type || "supporting"}
                      onChange={(e) =>
                        updateCast(idx, "role_type", e.target.value)
                      }
                    >
                      <option value="lead">Lead</option>
                      <option value="supporting">Supporting</option>
                      <option value="cameo">Cameo</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Order"
                      value={c.cast_order || ""}
                      onChange={(e) =>
                        updateCast(idx, "cast_order", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => removeCast(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-add-movie"
                  onClick={addCastMember}
                >
                  Add Cast Member
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? "💾 Update Movie" : "➕ Create Movie"}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters and Search */}
      <div className="mm-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by title or director..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All ({movies.length})
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "upcoming" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("upcoming")}
          >
            Upcoming ({movies.filter((m) => m.status === "upcoming").length})
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "now_showing" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("now_showing")}
          >
            Now Showing (
            {movies.filter((m) => m.status === "now_showing").length})
          </button>
          <button
            className={`filter-btn ${filterStatus === "ended" ? "active" : ""}`}
            onClick={() => setFilterStatus("ended")}
          >
            Ended ({movies.filter((m) => m.status === "ended").length})
          </button>
        </div>
      </div>

      {/* Movies List */}
      <div className="movies-list">
        {filteredMovies.length === 0 ? (
          <div className="empty-state">
            <p>📽️ No movies found</p>
            <small>Try adjusting your search or filters</small>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="movies-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Director</th>
                  <th>Duration</th>
                  <th>Release Date</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.movie_id}>
                    <td className="title-cell">
                      <div>
                        <p className="movie-title">{movie.title}</p>
                        {movie.original_title && (
                          <p className="original-title">
                            {movie.original_title}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>{movie.director || "-"}</td>
                    <td>
                      {movie.duration_minutes
                        ? `${movie.duration_minutes} min`
                        : "-"}
                    </td>
                    <td>
                      {movie.release_date
                        ? new Date(movie.release_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <span className={`status-badge status-${movie.status}`}>
                        {movie.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {movie.imdb_rating ? (
                        <span className="rating-badge">
                          ⭐ {movie.imdb_rating}
                        </span>
                      ) : (
                        <span className="rating-badge">N/A</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(movie)}
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeletingId(movie.movie_id)}
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirm Delete</h3>
            <p>
              Are you sure you want to delete this movie? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-confirm-delete"
                onClick={() => handleDelete(deletingId)}
              >
                🗑️ Delete
              </button>
              <button
                className="btn-cancel-delete"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieManagement;
