import { useState, useEffect } from "react";
import { apiService } from "../services/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "customer",
    status: "active",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await apiService.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load users data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "customer",
      status: "active",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        status: form.status,
      };

      // Add password only for new user creation
      if (!editingId && form.password) {
        payload.password = form.password;
      }

      if (editingId) {
        const res = await apiService.updateUser(editingId, payload);
        if (res.success && res.user) {
          setUsers((prev) =>
            prev.map((u) => (u.user_id === editingId ? res.user : u))
          );
          resetForm();
          setError("User updated successfully!");
          setTimeout(() => setError(null), 3000);
        } else {
          setError(res.message || "Failed to update user");
        }
      } else {
        const res = await apiService.createUser(payload);
        if (res.success && res.user) {
          setUsers((prev) => [res.user, ...prev]);
          resetForm();
          setError("User created successfully!");
          setTimeout(() => setError(null), 3000);
        } else {
          setError(res.message || "Failed to create user");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error saving user: " + err.message);
    }
  };

  const handleEdit = async (user) => {
    try {
      setEditingId(user.user_id);
      setForm({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "customer",
        status: user.status || "active",
      });
      setShowForm(true);
    } catch (err) {
      console.error(err);
      setError("Failed to load user for edit");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await apiService.deleteUser(id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.user_id !== id));
        setError("User deleted successfully!");
        setTimeout(() => setError(null), 3000);
      } else {
        setError(res.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      setError("Error deleting user: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
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
        <h2>👥 User Management</h2>
        <button
          className="btn-add-movie"
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
        >
          {showForm ? "✕ Cancel" : "➕ Add User"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="movie-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {!editingId && (
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editingId}
                />
              </div>
            )}

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-add-movie">
              {editingId ? "Update User" : "Create User"}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="items-grid">
        {users.length === 0 ? (
          <div className="no-items">No users found.</div>
        ) : (
          users.map((u) => (
            <div key={u.user_id} className="item-card user-card">
              <div className="mc-content">
                <h3 className="mc-title">
                  {u.first_name && u.last_name
                    ? `${u.first_name} ${u.last_name}`
                    : u.username}
                </h3>
                <p className="mc-meta">
                  <strong>Username:</strong> {u.username}
                </p>
                <p className="mc-meta">
                  <strong>Email:</strong> {u.email}
                </p>
                <p className="mc-meta">
                  <span>
                    Role: <strong>{u.role.toUpperCase()}</strong>
                  </span>
                  <span style={{ marginLeft: 12 }}>
                    Status:{" "}
                    <strong
                      style={{
                        color: u.status === "active" ? "#28a745" : "#dc3545",
                      }}
                    >
                      {u.status.toUpperCase()}
                    </strong>
                  </span>
                </p>
                <p
                  className="mc-meta"
                  style={{ fontSize: "0.9rem", color: "#888" }}
                >
                  Joined: {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="mc-actions">
                <button className="btn-edit" onClick={() => handleEdit(u)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(u.user_id)}
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

export default UserManagement;
