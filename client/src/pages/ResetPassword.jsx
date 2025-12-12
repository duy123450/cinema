import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { apiService } from "../services/api";
import PasswordInput from "../components/PasswordInput";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(null);

  // Validate token on component mount
  useEffect(() => {
    console.log("Token from URL:", token); // Debug log

    if (!token) {
      setIsTokenValid(false);
      return;
    }

    setIsTokenValid(true);
  }, [token]);

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      console.log("Submitting reset with token:", token); // Debug log
      console.log("Password:", formData.password); // Debug log

      // Make sure token and password are being sent correctly
      const response = await apiService.resetPassword(token, formData.password);

      console.log("Reset password response:", response); // Debug log

      if (response.success) {
        setSuccessMessage(
          "Password reset successfully! Redirecting to login..."
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrors({
          general: response.message || "Reset failed. Token may be expired.",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error); // Debug log
      let errorMessage = "Network error. Please try again.";

      if (error.response) {
        console.log("Error response data:", error.response.data); // Debug log
        errorMessage = error.response.data.message || "Reset failed";
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

  if (isTokenValid === null) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="error-message">
            Invalid or expired reset token. Please request a new password reset.
          </div>
          <Link to="/forgot-password" className="btn-submit reset-link-btn">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Reset Your Password</h2>
        <p className="reset-password-description">
          Enter your new password below.
        </p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Password Input with Eye Icon */}
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            label="New Password"
            error={errors.password}
            disabled={isLoading}
            required
          />

          {/* Confirm Password Input with Eye Icon */}
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            label="Confirm Password"
            error={errors.confirmPassword}
            disabled={isLoading}
            required
          />

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{" "}
          <Link to="/login" className="switch-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
