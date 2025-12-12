import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import AuthContext from "../contexts/AuthContext";
import PasswordInput from "../components/PasswordInput";

function Register() {
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    first_name: "", last_name: "", phone: "", date_of_birth: ""
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = "Min 3 chars";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password || form.password.length < 6) e.password = "Min 6 chars";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Mismatch";
    if (form.phone && !/^\+?\d{10,15}$/.test(form.phone)) e.phone = "Invalid phone";
    if (form.date_of_birth) {
      const age = new Date().getFullYear() - new Date(form.date_of_birth).getFullYear();
      if (age < 13) e.date_of_birth = "Min 13 years";
    }
    return e;
  };

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: "" }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) return setErrors({ avatar: "Image only" });
    if (file.size > 2 * 1024 * 1024) return setErrors({ avatar: "Max 2MB" });
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
    setErrors(p => ({ ...p, avatar: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const newErr = validate();
    if (Object.keys(newErr).length) return setErrors(newErr);
    setErrors({});
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("user_data", JSON.stringify(form));
      if (avatar) fd.append("avatar", avatar);
      const res = await apiService.registerUser(fd);
      if (res.success) {
        login(res.user);
        navigate("/");
      } else {
        setErrors({ general: res.message || "Failed" });
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account</h2>
        {errors.general && <div className="error-message">{errors.general}</div>}
        <form onSubmit={submit}>
          <div className="avatar-upload-section">
            <div className="avatar-preview">
              {preview ? <img src={preview} alt="Preview" /> : <div className="avatar-placeholder">Avatar</div>}
            </div>
            <label className="avatar-upload-label">
              <input type="file" accept="image/*" onChange={handleFile} disabled={loading} style={{ display: "none" }} />
              Upload Avatar
            </label>
            {errors.avatar && <span className="error-text">{errors.avatar}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" value={form.first_name} onChange={handle} disabled={loading} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" value={form.last_name} onChange={handle} disabled={loading} />
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={form.username} onChange={handle} className={errors.username ? "error" : ""} disabled={loading} />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handle} className={errors.email ? "error" : ""} disabled={loading} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handle} placeholder="Optional" className={errors.phone ? "error" : ""} disabled={loading} />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handle} className={errors.date_of_birth ? "error" : ""} disabled={loading} />
              {errors.date_of_birth && <span className="error-text">{errors.date_of_birth}</span>}
            </div>
          </div>

          <PasswordInput name="password" value={form.password} onChange={handle} label="Password" error={errors.password} disabled={loading} />
          <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={handle} label="Confirm Password" error={errors.confirmPassword} disabled={loading} />

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="auth-switch">Have an account? <Link to="/login" className="switch-link">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setErrors({});
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("user_data", JSON.stringify(form));
      if (avatar) fd.append("avatar", avatar);

      const res = await apiService.registerUser(fd);
      if (res.success) {
        login(res.user);
        navigate("/");
      } else {
        setErrors({ general: res.message || "Failed" });
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account</h2>
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="avatar-upload-section">
            <div className="avatar-preview">
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div className="avatar-placeholder">Avatar</div>
              )}
            </div>
            <label className="avatar-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                style={{ display: "none" }}
              />
              Upload Avatar
            </label>
            {errors.avatar && (
              <span className="error-text">{errors.avatar}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={errors.username ? "error" : ""}
              disabled={loading}
            />
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Optional"
                className={errors.phone ? "error" : ""}
                disabled={loading}
              />
              {errors.phone && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className={errors.date_of_birth ? "error" : ""}
                disabled={loading}
              />
              {errors.date_of_birth && (
                <span className="error-text">{errors.date_of_birth}</span>
              )}
            </div>
          </div>

          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            label="Password"
            error={errors.password}
            disabled={loading}
          />
          <PasswordInput
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            label="Confirm Password"
            error={errors.confirmPassword}
            disabled={loading}
          />

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="auth-switch">
          Have an account?{" "}
          <Link to="/login" className="switch-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
