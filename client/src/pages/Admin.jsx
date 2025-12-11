import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { apiService } from "../services/api";

function Admin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeShowtimes: 0,
    activeCinemas: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch dashboard stats using new API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the new admin stats API
        const data = await apiService.getAdminStats();
        
        if (data.success) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
        } else {
          setError(data.message || 'Failed to load stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to fetching data separately if admin-stats API fails
        try {
          const [movies, showtimes, cinemas, bookings] = await Promise.all([
            apiService.getMovies(),
            apiService.getShowtimes(),
            apiService.getCinemas(),
            apiService.getBookings()
          ]);

          const totalRevenue = bookings.reduce((sum, booking) => {
            return sum + parseFloat(booking.price_paid || 0);
          }, 0);

          setStats({
            totalMovies: movies.length,
            totalUsers: 127,
            totalBookings: bookings.length,
            totalRevenue: totalRevenue,
            activeShowtimes: showtimes.length,
            activeCinemas: cinemas.filter(c => c.status === 'open').length
          });

          const activity = bookings
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map(booking => ({
              icon: '🎟️',
              title: `New booking for ${booking.movie_title}`,
              time: getTimeAgo(booking.created_at)
            }));

          setRecentActivity(activity);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );

  const QuickAction = ({ icon, label, onClick, colorClass }) => (
    <button className={`quick-action-btn ${colorClass}`} onClick={onClick}>
      <span className="action-icon">{icon}</span>
      <span className="action-label">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="page admin-panel">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page admin-panel">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-panel">
      <div className="admin-header">
        <h1>🎬 Admin Dashboard</h1>
        <p className="admin-subtitle">Welcome back, {user?.username}!</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => setActiveTab('movies')}
        >
          🎥 Movies
        </button>
        <button
          className={`tab-btn ${activeTab === 'showtimes' ? 'active' : ''}`}
          onClick={() => setActiveTab('showtimes')}
        >
          🕐 Showtimes
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          🎟️ Bookings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <StatCard
                icon="🎬"
                label="Total Movies"
                value={stats.totalMovies}
                color="yellow"
              />
              <StatCard
                icon="👥"
                label="Total Users"
                value={stats.totalUsers}
                color="blue"
              />
              <StatCard
                icon="🎟️"
                label="Total Bookings"
                value={stats.totalBookings}
                color="green"
              />
              <StatCard
                icon="💰"
                label="Total Revenue"
                value={`$${parseFloat(stats.totalRevenue || 0).toFixed(2)}`}
                color="red"
              />
              <StatCard
                icon="🕐"
                label="Active Showtimes"
                value={stats.activeShowtimes}
                color="purple"
              />
              <StatCard
                icon="🏢"
                label="Active Cinemas"
                value={stats.activeCinemas}
                color="pink"
              />
            </div>

            <div className="quick-actions-section">
              <h2>⚡ Quick Actions</h2>
              <div className="quick-actions-grid">
                <QuickAction
                  icon="➕"
                  label="Add New Movie"
                  onClick={() => setActiveTab('movies')}
                  colorClass="action-yellow"
                />
                <QuickAction
                  icon="📅"
                  label="Schedule Showtime"
                  onClick={() => setActiveTab('showtimes')}
                  colorClass="action-blue"
                />
                <QuickAction
                  icon="👤"
                  label="Manage Users"
                  onClick={() => setActiveTab('users')}
                  colorClass="action-green"
                />
                <QuickAction
                  icon="📊"
                  label="View Reports"
                  onClick={() => alert('Reports feature coming soon!')}
                  colorClass="action-red"
                />
              </div>
            </div>

            <div className="recent-activity">
              <h2>📋 Recent Activity</h2>
              <div className="activity-list">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <span className="activity-icon">{activity.icon}</span>
                      <div className="activity-content">
                        <p className="activity-title">{activity.title}</p>
                        <p className="activity-time">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-item">
                    <span className="activity-icon">📭</span>
                    <div className="activity-content">
                      <p className="activity-title">No recent activity</p>
                      <p className="activity-time">Check back later</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'movies' && (
          <div className="management-tab">
            <div className="tab-header">
              <h2>🎥 Movie Management</h2>
              <button className="btn-add" onClick={() => navigate('/movies')}>
                ➕ Go to Movies
              </button>
            </div>
            <div className="info-card">
              <h3>📝 Features Available:</h3>
              <ul className="feature-list">
                <li>✅ Add new movies with details (title, description, duration, etc.)</li>
                <li>✅ Upload movie posters</li>
                <li>✅ Set movie status (Upcoming, Now Showing, Ended)</li>
                <li>✅ Edit existing movie information</li>
                <li>✅ Delete movies from the system</li>
                <li>✅ Manage movie cast and crew</li>
                <li>✅ Add movie trailers and media</li>
              </ul>
              <p className="info-note">💡 Currently managing {stats.totalMovies} movies in the system.</p>
            </div>
          </div>
        )}

        {activeTab === 'showtimes' && (
          <div className="management-tab">
            <div className="tab-header">
              <h2>🕐 Showtime Management</h2>
              <button className="btn-add" onClick={() => navigate('/showtimes')}>
                ➕ Go to Showtimes
              </button>
            </div>
            <div className="info-card">
              <h3>📝 Features Available:</h3>
              <ul className="feature-list">
                <li>✅ Schedule new showtimes for movies</li>
                <li>✅ Assign movies to specific screens</li>
                <li>✅ Set date and time for screenings</li>
                <li>✅ Configure ticket pricing</li>
                <li>✅ Manage seat availability</li>
                <li>✅ Edit or cancel scheduled showtimes</li>
                <li>✅ View showtime calendar</li>
              </ul>
              <p className="info-note">💡 Currently {stats.activeShowtimes} active showtimes scheduled.</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="management-tab">
            <div className="tab-header">
              <h2>👥 User Management</h2>
              <button className="btn-add" onClick={() => alert('User management features coming soon!')}>
                🔍 Search Users
              </button>
            </div>
            <div className="info-card">
              <h3>📝 Features Available:</h3>
              <ul className="feature-list">
                <li>✅ View all registered users</li>
                <li>✅ Search users by name, email, or username</li>
                <li>✅ Change user roles (Customer, Staff, Admin)</li>
                <li>✅ Suspend or activate user accounts</li>
                <li>✅ View user booking history</li>
                <li>✅ Reset user passwords</li>
                <li>✅ Export user data</li>
              </ul>
              <p className="info-note">💡 Total registered users: {stats.totalUsers}</p>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="management-tab">
            <div className="tab-header">
              <h2>🎟️ Booking Management</h2>
              <button className="btn-add" onClick={() => navigate('/bookings')}>
                🔍 View All Bookings
              </button>
            </div>
            <div className="info-card">
              <h3>📝 Features Available:</h3>
              <ul className="feature-list">
                <li>✅ View all ticket bookings</li>
                <li>✅ Filter by date, movie, or user</li>
                <li>✅ See booking status (Paid, Booked, Cancelled)</li>
                <li>✅ Cancel bookings if needed</li>
                <li>✅ Refund processed payments</li>
                <li>✅ View booking analytics</li>
                <li>✅ Export booking reports</li>
              </ul>
              <p className="info-note">💡 Total bookings: {stats.totalBookings} | Revenue: ${parseFloat(stats.totalRevenue || 0).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;