import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { apiService } from "../services/api";
import PasswordInput from "../components/PasswordInput";

function Profile() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setFormData({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      date_of_birth: user.date_of_birth || "",
    });

    const avatarUrl = user.avatar
      ? `http://localhost/server/uploads/${user.avatar}`
      : `https://ui-avatars.com/api/?name=${
          user.username || "U"
        }&background=200&color=fff`;

    setAvatarPreview(avatarUrl);
    setIsLoading(false);
  }, [user, navigate]);

  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10-15 digits (optional +)";
    }

    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 13) {
        newErrors.date_of_birth = "You must be at least 13 years old";
      }
    }

    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!passwordData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 characters";
    }

    if (passwordData.current_password === passwordData.new_password) {
      newErrors.new_password =
        "New password must be different from current password";
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: "",
      });
    }

    if (passwordSuccessMessage) {
      setPasswordSuccessMessage("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        setErrors({
          avatar: "Please upload an image file (jpg, png, gif, jpg, jfif)",
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setErrors({ avatar: "File size must be less than 2MB" });
        return;
      }

      setAvatarFile(file);
      formData.avatar = file;
      setAvatarPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, avatar: "" }));
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
    setIsUpdating(true);
    setSuccessMessage("");

    try {
      const finalData = { ...formData };

      if (avatarFile) {
        const updatedUser = await apiService.updateProfile(
          user.user_id,
          finalData,
          avatarFile
        );

        if (updatedUser) {
          updateUser(updatedUser);
          setSuccessMessage("Profile updated successfully!");

          if (updatedUser.avatar) {
            const newAvatarUrl = `/server/uploads/${updatedUser.avatar}`;
            setAvatarPreview(newAvatarUrl);
          }
        } else {
          setErrors({ general: "Update failed" });
        }
      } else {
        const updatedUser = await apiService.updateProfile(
          user.user_id,
          finalData
        );

        if (updatedUser) {
          updateUser(updatedUser);
          setSuccessMessage("Profile updated successfully!");
        } else {
          setErrors({ general: "Update failed" });
        }
      }
    } catch (error) {
      console.error("Update error:", error);
      let errorMessage = "Network error. Please try again.";

      if (error.response) {
        errorMessage = error.response.data.message || "Update failed";
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    const newErrors = validatePassword();
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setPasswordErrors({});
    setIsUpdatingPassword(true);
    setPasswordSuccessMessage("");

    try {
      const response = await apiService.updatePassword(user.user_id, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      if (response.success) {
        setPasswordSuccessMessage("Password updated successfully!");
        setPasswordData({
          current_password: "",
          new_password: "",
        });
      } else {
        setPasswordErrors({ general: response.message || "Update failed" });
      }
    } catch (error) {
      console.error("Password update error:", error);
      let errorMessage = "Network error. Please try again.";

      if (error.response) {
        errorMessage = error.response.data.message || "Update failed";
      }

      setPasswordErrors({ general: errorMessage });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      logout();
      navigate("/login");
    }
  };

  if (isLoading) {
    return <div className="page">Loading profile...</div>;
  }

  return (
    <div className="page profile-page">
      <h1 className="profile-heading">USER INFO</h1>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="avatar-upload">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="user-avatar-large"
            />
            <label className="avatar-upload-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUpdating}
                style={{ display: "none" }}
              />
              Change Photo
            </label>
          </div>
          {errors.avatar && <span className="error-text">{errors.avatar}</span>}
          <div className="user-role">
            {user.role === "admin"
              ? "Admin"
              : user.role === "staff"
              ? "Staff"
              : "Customer"}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Update Form */}
          <div className="profile-section">
            <h2>Profile Information</h2>

            {errors.general && (
              <div className="error-message">{errors.general}</div>
            )}

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={errors.username ? "error" : ""}
                    disabled={isUpdating}
                  />
                  {errors.username && (
                    <span className="error-text">{errors.username}</span>
                  )}
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
                    disabled={isUpdating}
                  />
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={isUpdating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? "error" : ""}
                    placeholder="+84 123 456 789 (Optional)"
                    disabled={isUpdating}
                  />
                  {errors.phone && (
                    <span className="error-text">{errors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className={errors.date_of_birth ? "error" : ""}
                    disabled={isUpdating}
                  />
                  {errors.date_of_birth && (
                    <span className="error-text">{errors.date_of_birth}</span>
                  )}
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Password Update Form */}
          <div className="profile-section password-section">
            <h2>Change Password</h2>

            {passwordErrors.general && (
              <div className="error-message">{passwordErrors.general}</div>
            )}

            {passwordSuccessMessage && (
              <div className="success-message">{passwordSuccessMessage}</div>
            )}

            <form onSubmit={handlePasswordUpdate}>
              <PasswordInput
                id="current_password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                label="Current Password"
                error={passwordErrors.current_password}
                disabled={isUpdatingPassword}
                required
              />

              <PasswordInput
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                label="New Password"
                error={passwordErrors.new_password}
                disabled={isUpdatingPassword}
                required
              />

              <div className="profile-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
