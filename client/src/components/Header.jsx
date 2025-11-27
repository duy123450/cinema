// src/components/Header.jsx

import React, { useContext, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import useClickOutside from "../hooks/useClickOutside";
import { apiService } from "../services/api";

function Header() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));
  useClickOutside(notificationRef, () => setIsNotificationOpen(false));

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
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsNotificationOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsUserDropdownOpen(false);
  };

  // Sample notifications
  const notifications = [
    { id: 1, message: "New movie added: Spider-Man", time: "2 mins ago" },
    { id: 2, message: "Booking confirmed: Seat A1", time: "1 hour ago" },
    { id: 3, message: "Showtime changed: Avengers", time: "3 hours ago" },
  ];

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

  const notificationMenu = (
    <div className="notification-menu" ref={notificationRef}>
      <div
        className="notification-btn"
        onClick={toggleNotification}
        role="button"
        aria-label="Notifications"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleNotification()}
        style={{ cursor: "pointer" }}
      >
        🔔
      </div>

      {/* Notification Dropdown */}
      {isNotificationOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            <span className="notification-count">{notifications.length}</span>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
            ))}
          </div>
          <div className="notification-footer">
            <button className="view-all-btn">View All</button>
          </div>
        </div>
      )}
    </div>
  );

  const userMenu = user ? (
    <div className="user-menu" ref={userDropdownRef}>
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
      {isUserDropdownOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className="role">{user.role}</span>
          </div>
          <div className="menu-items">
            <Link
              to="/profile"
              className="menu-item"
              onClick={() => setIsUserDropdownOpen(false)}
            >
              User Info
            </Link>

            <Link
              to="/bookings"
              className="menu-item"
              onClick={() => setIsUserDropdownOpen(false)}
            >
              Movies
            </Link>

            <Link
              to="/history"
              className="menu-item"
              onClick={() => setIsUserDropdownOpen(false)}
            >
              My Bookings
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin"
                className="menu-item"
                onClick={() => setIsUserDropdownOpen(false)}
              >
                Admin Panel
              </Link>
            )}

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
          to="/buy-tickets"
          className={`nav-link ${
            location.pathname === "/buy-tickets" ? "active" : ""
          }`}
        >
          Buy Tickets
        </Link>
      </nav>

      <div className="header-buttons">
        {notificationMenu}
        {userMenu}
      </div>
    </header>
  );
}

export default Header;
