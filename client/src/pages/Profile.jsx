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