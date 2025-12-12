import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import AuthContext from "../contexts/AuthContext";
import PasswordInput from "../components/PasswordInput";

function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.identifier) e.identifier = "Username or Email is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) return setErrors(newErrors);
    
    setErrors({});
    setLoading(true);
    try {
      const res = await apiService.login(form);
      if (res.success) {
        login(res.user);
        setSuccess("Login successful!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        setErrors({ general: res.message || "Login failed" });
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
        <h2>Login to Your Account</h2>
        {success && <div className="success-message">{success}</div>}
        {errors.general && <div className="error-message">{errors.general}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              className={errors.identifier ? "error" : ""}
              disabled={loading}
              placeholder="Enter username or email"
            />
            {errors.identifier && <span className="error-text">{errors.identifier}</span>}
          </div>
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            label="Password"
            error={errors.password}
            disabled={loading}
          />
          <p className="auth-switch">
            <Link to="/forgot-password" className="switch-link">Forgot password?</Link>
          </p>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="switch-link">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="switch-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
