import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { apiService } from "../services/api";

function Profile() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

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
    });

    // Set avatar preview
    const avatarUrl = user.avatar
      ? `/server/uploads/${user.avatar}`
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
      newErrors.phone = "Phone number is invalid";
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        setErrors({ avatar: "Please upload an image file (jpg, png, gif, jpg, jfif)" });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ avatar: "File size must be less than 2MB" });
        return;
      }

      setAvatarFile(file);
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
      let finalData = { ...formData };

      // Handle avatar upload
      if (avatarFile) {
        const formDataWithAvatar = new FormData();
        formDataWithAvatar.append("user_id", user.user_id);
        formDataWithAvatar.append("profile_data", JSON.stringify(finalData));
        formDataWithAvatar.append("avatar", avatarFile);

        // 👇 Use updateProfile for everything
        const updatedUser = await apiService.updateProfile(formDataWithAvatar);

        if (updatedUser) {
          // 👇 Update context with full user data including avatar
          updateUser(updatedUser);
          setSuccessMessage("Profile updated successfully!");

          // 👇 Update avatar preview immediately
          if (updatedUser.avatar) {
            const newAvatarUrl = `/server/uploads/${updatedUser.avatar}`;
            setAvatarPreview(newAvatarUrl);
          }
        } else {
          setErrors({ general: "Update failed" });
        }
      } else {
        // No avatar upload, just update profile
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

  const handleLogout = () => {
    logout();
    navigate("/login");
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

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? "error" : ""}
                placeholder="+84 123 456 789"
                disabled={isUpdating}
              />
              {errors.phone && (
                <span className="error-text">{errors.phone}</span>
              )}
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
      </div>
    </div>
  );
}

export default Profile;
