// src/pages/Login.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
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

    // Clear error when user types
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

    setErrors({}); // Clear any existing errors
    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Login submitted:", formData);
      // Add your actual login logic here
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({ general: "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login to Your Account</h2>

        {/* 👇 General error message */}
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
              disabled={isLoading}
            />
            {/* 👇 Email error message */}
            {errors.email && <span className="error-text">{errors.email}</span>}
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
            {/* 👇 Password error message */}
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
