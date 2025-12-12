import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { apiService } from "../services/api";
import PasswordInput from "../components/PasswordInput";

function Profile() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", first_name: "", last_name: "", phone: "", date_of_birth: ""
  });
  const [pwd, setPwd] = useState({ current: "", new: "" });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [pwdErrors, setPwdErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  useEffect(() => {
    if (!user) { nav("/login"); return; }
    setForm({ username: user.username || "", email: user.email || "", first_name: user.first_name || "", last_name: user.last_name || "", phone: user.phone || "", date_of_birth: user.date_of_birth || "" });
    setPreview(user.avatar ? `http://localhost/server/uploads/${user.avatar}` : `https://ui-avatars.com/api/?name=${user.username || "U"}&background=200&color=fff`);
    setLoading(false);
  }, [user, nav]);

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = "Min 3 chars";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (form.phone && !/^\+?\d{10,15}$/.test(form.phone)) e.phone = "Invalid phone";
    if (form.date_of_birth) {
      const age = new Date().getFullYear() - new Date(form.date_of_birth).getFullYear();
      if (age < 13) e.date_of_birth = "Min 13 years";
    }
    return e;
  };

  const validatePwd = () => {
    const e = {};
    if (!pwd.current) e.current = "Required";
    if (!pwd.new || pwd.new.length < 6) e.new = "Min 6 chars";
    if (pwd.current === pwd.new) e.new = "Must be different";
    return e;
  };

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: "" }));
    setSuccess("");
  };

  const handlePwd = (e) => {
    const { name, value } = e.target;
    setPwd(p => ({ ...p, [name]: value }));
    if (pwdErrors[name]) setPwdErrors(e => ({ ...e, [name]: "" }));
    setPwdSuccess("");
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) return setErrors({ avatar: "Image only" });
    if (file.size > 5 * 1024 * 1024) return setErrors({ avatar: "Max 5MB" });
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    const newErr = validate();
    if (Object.keys(newErr).length) return setErrors(newErr);
    setErrors({});
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append("user_data", JSON.stringify(form));
      if (avatar) fd.append("avatar", avatar);
      const res = await apiService.updateProfile(fd);
      if (res.success) {
        updateUser(res.user);
        setSuccess("Profile updated!");
        setAvatar(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setErrors({ general: res.message || "Failed" });
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Error" });
    } finally {
      setUpdating(false);
    }
  };

  const submitPwd = async (e) => {
    e.preventDefault();
    const newErr = validatePwd();
    if (Object.keys(newErr).length) return setPwdErrors(newErr);
    setPwdErrors({});
    setUpdating(true);
    try {
      const res = await apiService.updatePassword(pwd);
      if (res.success) {
        setPwd({ current: "", new: "" });
        setPwdSuccess("Password changed!");
        setTimeout(() => setPwdSuccess(""), 3000);
      } else {
        setPwdErrors({ general: res.message || "Failed" });
      }
    } catch (err) {
      setPwdErrors({ general: err.response?.data?.message || "Error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page profile-page">
      <h1>USER INFO</h1>
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="avatar-upload">
            <img src={preview} alt="Avatar" className="user-avatar-large" />
            <label className="avatar-upload-label">
              <input type="file" accept="image/*" onChange={handleFile} disabled={updating} style={{ display: "none" }} />
              Update Avatar
            </label>
            {errors.avatar && <span className="error-text">{errors.avatar}</span>}
          </div>
        </div>
        <div className="profile-content">
          {success && <div className="success-message">{success}</div>}
          {errors.general && <div className="error-message">{errors.general}</div>}
          <form onSubmit={submit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" value={form.first_name} onChange={handle} disabled={updating} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" value={form.last_name} onChange={handle} disabled={updating} />
              </div>
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" value={form.username} onChange={handle} className={errors.username ? "error" : ""} disabled={updating} />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handle} className={errors.email ? "error" : ""} disabled={updating} />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={form.phone} onChange={handle} className={errors.phone ? "error" : ""} disabled={updating} />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handle} className={errors.date_of_birth ? "error" : ""} disabled={updating} />
                {errors.date_of_birth && <span className="error-text">{errors.date_of_birth}</span>}
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={updating}>{updating ? "Updating..." : "Update Profile"}</button>
          </form>

          {pwdSuccess && <div className="success-message">{pwdSuccess}</div>}
          {pwdErrors.general && <div className="error-message">{pwdErrors.general}</div>}
          <form onSubmit={submitPwd} className="password-form">
            <h3>Change Password</h3>
            <PasswordInput name="current" label="Current Password" value={pwd.current} onChange={handlePwd} error={pwdErrors.current} disabled={updating} />
            <PasswordInput name="new" label="New Password" value={pwd.new} onChange={handlePwd} error={pwdErrors.new} disabled={updating} />
            <button type="submit" className="btn-submit" disabled={updating}>{updating ? "Changing..." : "Change Password"}</button>
          </form>

          <div className="logout-section">
            <button onClick={() => { logout(); nav("/login"); }} className="btn-danger">🚪 Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
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
