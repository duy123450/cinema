import { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import useClickOutside from "../hooks/useClickOutside";
import { apiService } from "../services/api";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [count, setCount] = useState(0);
  const userRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(userRef, () => setUserOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const d = await apiService.getNotifications();
        if (d.success) { setNotifs(d.notifications); setCount(d.count); }
      } catch (e) { console.error(e); }
    })();
    const i = setInterval(() => {
      apiService.getNotifications().then(d => {
        if (d.success) { setNotifs(d.notifications); setCount(d.count); }
      }).catch(e => console.error(e));
    }, 300000);
    return () => clearInterval(i);
  }, [user]);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">🎬 CINEMA</Link>
        <SearchBar />
        <div className="header-buttons">
          <ThemeToggle />
          {user ? (
            <>
              <div ref={notifRef} className="notification-wrapper">
                <button className="header-btn" onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}>
                  🔔 {count > 0 && <span className="badge">{count}</span>}
                </button>
                {notifOpen && <div className="notification-menu">{notifs.map(n => <div key={n.id} onClick={() => { navigate(n.link); setNotifOpen(false); }}>{n.message}</div>)}</div>}
              </div>
              <div ref={userRef} className="user-wrapper">
                <button className="header-btn" onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}>
                  <img src={user.avatar ? `http://localhost/server/uploads/${user.avatar}` : `https://ui-avatars.com/api/?name=${user.username}&background=200&color=fff`} alt="Avatar" />
                </button>
                {userOpen && (
                  <div className="user-dropdown">
                    <p>{user.username}</p>
                    <Link to="/profile">👤 Profile</Link>
                    <Link to="/bookings">🎟️ Bookings</Link>
                    {user.role === "admin" && <Link to="/admin">⚙️ Admin</Link>}
                    <button onClick={() => { logout(); navigate("/login"); }}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
    return user.avatar
      ? `http://localhost/server/uploads/${user.avatar}`
      : `https://ui-avatars.com/api/?name=${
          user.username || "U"
        }&background=200&color=fff`;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "movie":
        return "🎬";
      case "promotion":
        return "🎁";
      case "booking":
        return "🎟️";
      case "reminder":
        return "⏰";
      case "birthday":
        return "🎂";
      default:
        return "🔔";
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case "movie":
        return "notification-movie";
      case "promotion":
        return "notification-promotion";
      case "booking":
        return "notification-booking";
      case "reminder":
        return "notification-reminder";
      case "birthday":
        return "notification-birthday";
      default:
        return "notification-default";
    }
  };

  const notificationMenu = user ? (
    <div className="notification-menu" ref={notificationRef}>
      <div
        className="notification-btn"
        onClick={toggleNotification}
        role="button"
        aria-label="Notifications"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleNotification()}
        style={{ cursor: "pointer", position: "relative" }}
      >
        🔔
        {notificationCount > 0 && (
          <span className="notification-badge">{notificationCount}</span>
        )}
      </div>

      {/* Notification Dropdown */}
      {isNotificationOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {notificationCount > 0 && (
              <span className="notification-count">{notificationCount}</span>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner-small"></div>
                <span>Loading...</span>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${getNotificationColor(
                    notification.type
                  )}`}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <span className="notification-time">
                      {notification.time}
                    </span>
                  </div>
                  {notification.image && (
                    <div className="notification-image">
                      <img src={notification.image} alt="" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="notification-empty">
                <span className="empty-icon">🔕</span>
                <p>No new notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                className="view-all-btn"
                onClick={() => {
                  setIsNotificationOpen(false);
                  navigate("/notifications");
                }}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  ) : null;

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
              My Tickets
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
          to="/cinemas"
          className={`nav-link ${
            location.pathname === "/cinemas" ? "active" : ""
          }`}
        >
          Cinemas
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

      <div className="header-right">
        <SearchBar />
        <div className="header-buttons">
          <ThemeToggle />
          {notificationMenu}
          {userMenu}
        </div>
      </div>
    </header>
  );
}

export default Header;
