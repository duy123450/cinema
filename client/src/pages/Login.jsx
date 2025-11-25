import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

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

        {/* 👇 Show success message */}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* 👇 Show error message */}
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

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "error" : ""}
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

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
