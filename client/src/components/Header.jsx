// src/components/Header.jsx

import React, { useContext, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import useClickOutside from "../hooks/useClickOutside";
import { apiService } from "../services/api";

function Header() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Generate avatar URL
  const getAvatarUrl = () => {
    if (user.avatar) {
      return `http://localhost/server/uploads/${user.avatar}`;
    }
    // Fallback to placeholder if no avatar
    return `https://ui-avatars.com/api/?name=${
      user.username || "U"
    }&background=200&color=fff`;
  };

  const userMenu = user ? (
    <div className="user-menu" ref={dropdownRef}>
      <img
        src={getAvatarUrl()}
        alt={user.username}
        className="user-avatar-image"
        onClick={toggleDropdown}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleDropdown()}
        style={{ cursor: "pointer" }}
      />

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className="role">{user.role}</span>
          </div>
          <div className="menu-items">
            <Link
              to="/profile"
              className="menu-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              User info
            </Link>

            <Link
              to="/bookings"
              className="menu-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              Movies
            </Link>

            <Link
              to="/history"
              className="menu-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              History
            </Link>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <Link to="/login" className="btn-secondary login-btn">
      Login
    </Link>
  );

  return (
    <header className="header">
      <div className="logo">🎬 CINEMA</div>

      <nav className="navbar">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Dashboard
        </Link>

        <Link
          to="/movies"
          className={`nav-link ${
            location.pathname === "/movies" ? "active" : ""
          }`}
        >
          Movies
        </Link>

        <Link
          to="/showtimes"
          className={`nav-link ${
            location.pathname === "/showtimes" ? "active" : ""
          }`}
        >
          Showtimes
        </Link>

        <Link
          to="/theaters"
          className={`nav-link ${
            location.pathname === "/cinemas" ? "active" : ""
          }`}
        >
          Theaters
        </Link>

        <Link
          to="/bookings"
          className={`nav-link ${
            location.pathname === "/bookings" ? "active" : ""
          }`}
        >
          My Bookings
        </Link>
      </nav>

      <div className="header-buttons">
        <button className="btn-primary">Buy Tickets</button>
        {userMenu}
      </div>
    </header>
  );
}

export default Header;
