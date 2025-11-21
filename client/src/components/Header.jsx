// src/components/header.jsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  // 👇 Replace this with real auth state from your system
  const userRole = "user"; // Change to 'admin' to test admin panel visibility

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <header className="header">
      <div className="logo">🎬 CINEMA</div>

      <nav className="navbar">
        {/* 👇 User Navigation */}
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
          to="/cinemas"
          className={`nav-link ${
            location.pathname === "/cinemas" ? "active" : ""
          }`}
        >
          Cinemas
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
        {/* 👇 Show Admin Panel only if user is admin */}
        {userRole === "admin" && (
          <Link to="/admin" className="btn-admin">
            Admin Panel
          </Link>
        )}

        <button className="btn-primary">Buy Tickets</button>

        {isLoggedIn ? (
          <button className="btn-secondary logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="btn-secondary login-btn">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
