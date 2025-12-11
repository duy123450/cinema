import { useState, useEffect } from "react";
import { apiService } from "../services/api";

function ShowtimeManagement() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    movie_id: "",
    cinema_id: "",
    screen_number: "",
    screen_type: "Standard",
    show_date: "",
    show_time: "",
    price: "",
    available_seats: "",
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [st, mv, cn] = await Promise.all([
          apiService.getShowtimes(),
          apiService.getMovies(),
          apiService.getCinemas(),
        ]);
        setShowtimes(Array.isArray(st) ? st : []);
        setMovies(Array.isArray(mv) ? mv : []);
        setCinemas(Array.isArray(cn) ? cn : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load showtimes data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      movie_id: "",
      cinema_id: "",
      screen_number: "",
      screen_type: "Standard",
      show_date: "",
      show_time: "",
      price: "",
      available_seats: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        movie_id: parseInt(form.movie_id, 10),
        cinema_id: parseInt(form.cinema_id, 10),
        screen_number: form.screen_number,
        screen_type: form.screen_type,
        show_date: form.show_date,
        show_time: form.show_time,
        price: parseFloat(form.price) || 0,
        available_seats: parseInt(form.available_seats, 10) || 0,
      };

      if (editingId) {
        const res = await apiService.updateShowtime(editingId, payload);
        if (res.success) {
          setShowtimes((prev) =>
            prev.map((s) =>
              s.showtime_id === editingId ? { ...s, ...payload } : s
            )
          );
          resetForm();
          setError("Showtime updated successfully!");
          setTimeout(() => setError(null), 3000);
        } else {
          setError(res.message || "Failed to update showtime");
        }
      } else {
        const res = await apiService.createShowtime(payload);
        if (res.success) {
          const newShowtime = res.showtime
            ? res.showtime
            : {
                showtime_id: res.showtime_id || Date.now(),
                ...payload,
              };
          setShowtimes((prev) => [newShowtime, ...prev]);
          resetForm();
          setError("Showtime created successfully!");
          setTimeout(() => setError(null), 3000);
        } else {
          setError(res.message || "Failed to create showtime");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error saving showtime: " + err.message);
    }
  };

  const handleEdit = async (st) => {
    try {
      setEditingId(st.showtime_id);
      setForm({
        movie_id: String(st.movie_id || ""),
        cinema_id: String(st.cinema_id || ""),
        screen_number: st.screen_number || "",
        screen_type: st.screen_type || "Standard",
        show_date: st.show_date || "",
        show_time: st.show_time || "",
        price: st.price || "",
        available_seats: st.available_seats || "",
      });
      setShowForm(true);
    } catch (err) {
      console.error(err);
      setError("Failed to load showtime for edit");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this showtime?")) return;
    try {
      const res = await apiService.deleteShowtime(id);
      if (res.success) {
        setShowtimes((prev) => prev.filter((s) => s.showtime_id !== id));
        setError("Showtime deleted successfully!");
        setTimeout(() => setError(null), 3000);
      } else {
        setError(res.message || "Failed to delete showtime");
      }
    } catch (err) {
      console.error(err);
      setError("Error deleting showtime: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="showtime-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading showtimes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="showtime-management">
      {error && (
        <div
          className={`message ${
            error.includes("successfully") ? "success" : "error"
          }`}
        >
          {error}
        </div>
      )}

      <div className="mm-header">
        <h2>🗓️ Showtime Management</h2>
        <button
          className="btn-add-movie"
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
        >
          {showForm ? "✕ Cancel" : "➕ Add Showtime"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="movie-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Movie *</label>
              <select
                name="movie_id"
                value={form.movie_id}
                onChange={handleChange}
                required
              >
                <option value="">Select movie</option>
                {movies.map((m) => (
                  <option key={m.movie_id} value={m.movie_id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cinema *</label>
              <select
                name="cinema_id"
                value={form.cinema_id}
                onChange={handleChange}
                required
              >
                <option value="">Select cinema</option>
                {cinemas.map((c) => (
                  <option key={c.cinema_id || c.id} value={c.cinema_id || c.id}>
                    {c.name || c.cinema_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Screen #</label>
              <input
                name="screen_number"
                value={form.screen_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Screen Type</label>
              <select
                name="screen_type"
                value={form.screen_type}
                onChange={handleChange}
              >
                <option>Standard</option>
                <option>IMAX</option>
                <option>Dolby</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="show_date"
                value={form.show_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                name="show_time"
                value={form.show_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Available Seats</label>
              <input
                type="number"
                name="available_seats"
                value={form.available_seats}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-add-movie">
              {editingId ? "Update Showtime" : "Create Showtime"}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="items-grid">
        {showtimes.length === 0 ? (
          <div className="no-items">No showtimes configured.</div>
        ) : (
          showtimes.map((s) => (
            <div key={s.showtime_id} className="item-card movie-card">
              <div className="mc-content">
                <h3 className="mc-title">
                  {s.title || s.movie_title || s.movie_name}
                </h3>
                <p className="mc-meta">
                  <strong>Cinema:</strong> {s.cinema_name || s.name} •{" "}
                  <strong>Date:</strong> {s.show_date} • <strong>Time:</strong>{" "}
                  {s.show_time}
                </p>
                <p className="mc-meta">
                  <span>
                    Screen: {s.screen_number}{" "}
                    {s.screen_type ? `(${s.screen_type})` : ""}
                  </span>
                  <span style={{ marginLeft: 12 }}>
                    Seats: {s.available_seats}
                  </span>
                  <span style={{ marginLeft: 12 }}>Price: ${s.price}</span>
                </p>
              </div>

              <div className="mc-actions">
                <button className="btn-edit" onClick={() => handleEdit(s)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(s.showtime_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ShowtimeManagement;
