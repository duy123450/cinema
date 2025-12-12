import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AuthContext from "../contexts/AuthContext";
import { apiService } from "../services/api";
import MovieManagement from "../components/MovieManagement";
import ShowtimeManagement from "../components/ShowtimeManagement";
import UserManagement from "../components/UserManagement";
import BookingManagement from "../components/BookingManagement";

function Admin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeShowtimes: 0,
    activeCinemas: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
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

          // Fetch bookings to generate chart data
          const bookings = await apiService.getBookings();
          const last7Days = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push({
              date: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              fullDate: date.toISOString().split("T")[0],
              bookings: 0,
              revenue: 0,
            });
          }

          bookings.forEach((booking) => {
            const bookingDate = new Date(booking.created_at)
              .toISOString()
              .split("T")[0];
            const dayData = last7Days.find((d) => d.fullDate === bookingDate);
            if (dayData) {
              dayData.bookings += 1;
              dayData.revenue += parseFloat(booking.price_paid || 0);
            }
          });

          setChartData(last7Days);
        } else {
          setError(data.message || "Failed to load stats");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback to fetching data separately if admin-stats API fails
        try {
          const [movies, showtimes, cinemas, bookings] = await Promise.all([
            apiService.getMovies(),
            apiService.getShowtimes(),
            apiService.getCinemas(),
            apiService.getBookings(),
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
            activeCinemas: cinemas.filter((c) => c.status === "open").length,
          });

          const activity = bookings
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map((booking) => ({
              icon: "🎟️",
              title: `New booking for ${booking.movie_title}`,
              time: getTimeAgo(booking.created_at),
            }));

          setRecentActivity(activity);

          // Generate chart data from bookings (last 7 days)
          const last7Days = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push({
              date: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              fullDate: date.toISOString().split("T")[0],
              bookings: 0,
              revenue: 0,
            });
          }

          bookings.forEach((booking) => {
            const bookingDate = new Date(booking.created_at)
              .toISOString()
              .split("T")[0];
            const dayData = last7Days.find((d) => d.fullDate === bookingDate);
            if (dayData) {
              dayData.bookings += 1;
              dayData.revenue += parseFloat(booking.price_paid || 0);
            }
          });

          setChartData(last7Days);
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          setError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
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
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
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
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "movies" ? "active" : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          🎥 Movies
        </button>
        <button
          className={`tab-btn ${activeTab === "showtimes" ? "active" : ""}`}
          onClick={() => setActiveTab("showtimes")}
        >
          🕐 Showtimes
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          🎟️ Bookings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "overview" && (
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
                  onClick={() => setActiveTab("movies")}
                  colorClass="action-yellow"
                />
                <QuickAction
                  icon="📅"
                  label="Schedule Showtime"
                  onClick={() => setActiveTab("showtimes")}
                  colorClass="action-blue"
                />
                <QuickAction
                  icon="👤"
                  label="Manage Users"
                  onClick={() => setActiveTab("users")}
                  colorClass="action-green"
                />
                <QuickAction
                  icon="📊"
                  label="View Reports"
                  onClick={() => alert("Reports feature coming soon!")}
                  colorClass="action-red"
                />
              </div>
            </div>

            <div className="analytics-section">
              <h2>📈 Booking & Revenue Trend (Last 7 Days)</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #ffd700",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#ffd700" }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="bookings"
                      stroke="#ffd700"
                      strokeWidth={2}
                      name="Bookings"
                      dot={{ fill: "#ffd700", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4a9eff"
                      strokeWidth={2}
                      name="Revenue ($)"
                      dot={{ fill: "#4a9eff", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="activity-section">
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

        {activeTab === "movies" && <MovieManagement />}

        {activeTab === "showtimes" && <ShowtimeManagement />}

        {activeTab === "users" && <UserManagement />}

        {activeTab === "bookings" && <BookingManagement />}
      </div>
    </div>
  );
}

export default Admin;
