import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
