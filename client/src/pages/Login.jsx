import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../contexts/AuthContext";
import PasswordInput from "../components/PasswordInput";

function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [successMessage, setSuccessMessage] = useState("");

  const api = axios.create({
    baseURL: import.meta.env.DEV ? "http://localhost/server/api" : "/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const validate = () => {
    const newErrors = {};

    if (!formData.identifier) {
      newErrors.identifier = "Username or Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/login.php", formData);

      if (response.data.success) {
        login(response.data.user);
        setSuccessMessage("Login successful!");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setErrors({ general: response.data.message || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Network error. Please try again.";

      if (error.response) {
        errorMessage = error.response.data.message || "Login failed";
      } else if (error.request) {
        errorMessage = "Network error. Check if server is running.";
      } else {
        errorMessage = "An unexpected error occurred.";
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login to Your Account</h2>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              className={errors.identifier ? "error" : ""}
              disabled={isLoading}
              placeholder="Enter username or email"
            />
            {errors.identifier && (
              <span className="error-text">{errors.identifier}</span>
            )}
          </div>

          {/* Password Input with Eye Icon */}
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            label="Password"
            error={errors.password}
            disabled={isLoading}
            required
          />

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
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
