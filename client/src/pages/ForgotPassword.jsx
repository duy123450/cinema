import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setEmail(value);

    if (errors.email) {
      setErrors({
        ...errors,
        email: "",
      });
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleSubmit = async (e) => {
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
      const response = await apiService.forgotPassword(email);

      if (response.success) {
        setSuccessMessage(
          response.message || "Password reset link sent to your email!"
        );
        setEmail("");
      } else {
        setErrors({ general: response.message || "Request failed" });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      let errorMessage = "Network error. Please try again.";

      if (error.response) {
        errorMessage = error.response.data.message || "Request failed";
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
        <h2>Forgot Password?</h2>
        <p className="forgot-password-description">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
              disabled={isLoading}
              placeholder="Enter your email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{" "}
          <Link to="/login" className="switch-link">
            Login
          </Link>
        </p>

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

export default ForgotPassword;
