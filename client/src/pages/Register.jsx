// src/pages/Register.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    // Confirm password validation (only if password is filled)
    if (formData.password && !formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If user is typing in password field
    if (name === "password") {
      // If password is being cleared (empty), also clear confirm password
      if (!value) {
        setFormData({
          ...formData,
          [name]: value,
          confirmPassword: "", // 👈 Clear confirm password when password is cleared
        });
        // Clear confirm password error too
        if (errors.confirmPassword) {
          setErrors({
            ...errors,
            confirmPassword: "",
          });
        }
      } else {
        // Otherwise just update password
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      // For other fields (name, email, confirmPassword), update normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error when user types in the field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Clear confirm password error when password changes (but not when clearing)
    if (name === "password" && value && errors.confirmPassword) {
      setErrors({
        ...errors,
        confirmPassword: "",
      });
    }
  };

  const handleRegister = async (e) => {
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
      console.log("Register submitted:", formData);
      // Add your actual registration logic here
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create New Account</h2>

        {/* 👇 General error message */}
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "error" : ""}
              disabled={isLoading}
            />
            {/* 👇 Name error message */}
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? "error" : ""}
              disabled={isLoading || !formData.password} // 👈 Disabled if password is empty
            />
            {/* 👇 Confirm password error message */}
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}

            {/* 👇 Helper text when confirm password is disabled */}
            {!formData.password && (
              <span className="disabled-text">Enter a password first</span>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="switch-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
