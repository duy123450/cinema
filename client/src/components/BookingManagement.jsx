import { useState, useEffect, useContext } from "react";
import { apiService } from "../services/api";
import AuthContext from "../contexts/AuthContext";

function BookingManagement() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterMovie, setFilterMovie] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    paidBookings: 0,
    cancelledBookings: 0,
    avgRevenuePerBooking: 0,
    totalConcessions: 0,
  });

  // Fetch all users and their bookings (admin only)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is admin
        if (!user || user.role !== "admin") {
          setError("Access denied. Admin privileges required.");
          setLoading(false);
          return;
        }

        // Fetch all users first
        const usersData = await apiService.getUsers();

        // Fetch bookings for all users
        const allBookings = [];

        if (Array.isArray(usersData) && usersData.length > 0) {
          // Fetch bookings for each user
          for (const currentUser of usersData) {
            try {
              const userBookings = await apiService.getBookings(
                currentUser.user_id
              );

              if (Array.isArray(userBookings)) {
                // Add username to each booking
                const bookingsWithUsername = userBookings.map((booking) => ({
                  ...booking,
                  username: currentUser.username,
                  user_email: currentUser.email,
                  user_name: `${currentUser.first_name || ""} ${
                    currentUser.last_name || ""
                  }`.trim(),
                }));
                allBookings.push(...bookingsWithUsername);
              }
            } catch (err) {
              console.error(
                `Error fetching bookings for user ${currentUser.user_id}:`,
                err
              );
              // Continue with other users even if one fails
            }
          }
        }

        // Sort bookings by created_at (newest first)
        allBookings.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setBookings(allBookings);
        setFilteredBookings(allBookings);

        // Calculate analytics
        calculateAnalytics(allBookings);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load bookings: " + (err.message || "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  // Calculate analytics
  const calculateAnalytics = (bookingsData) => {
    const totalBookings = bookingsData.length;
    const totalRevenue = bookingsData.reduce(
      (sum, booking) => sum + parseFloat(booking.price_paid || 0),
      0
    );
    const paidBookings = bookingsData.filter((b) => b.status === "paid").length;
    const cancelledBookings = bookingsData.filter(
      (b) => b.status === "cancelled"
    ).length;
    const avgRevenuePerBooking =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate total concessions revenue
    let totalConcessions = 0;
    bookingsData.forEach((booking) => {
      if (booking.concessions && Array.isArray(booking.concessions)) {
        booking.concessions.forEach((c) => {
          totalConcessions += (c.price || 0) * (c.quantity || 0);
        });
      }
    });

    setAnalytics({
      totalBookings,
      totalRevenue,
      paidBookings,
      cancelledBookings,
      avgRevenuePerBooking,
      totalConcessions,
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = bookings;

    if (filterDate) {
      filtered = filtered.filter((b) => {
        if (!b.show_date) return false;
        const bookingDate = new Date(b.show_date).toLocaleDateString("en-CA");
        return bookingDate === filterDate;
      });
    }

    if (filterMovie) {
      filtered = filtered.filter((b) =>
        b.movie_title?.toLowerCase().includes(filterMovie.toLowerCase())
      );
    }

    if (filterUser) {
      filtered = filtered.filter(
        (b) =>
          b.user_id?.toString() === filterUser ||
          b.username?.toLowerCase().includes(filterUser.toLowerCase()) ||
          b.user_email?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    setFilteredBookings(filtered);

    // Recalculate analytics for filtered data
    calculateAnalytics(filtered);
  }, [filterDate, filterMovie, filterUser, filterStatus, bookings]);

  // Handle booking cancellation
  const handleCancelBooking = async (ticketId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const result = await apiService.cancelBooking(ticketId);
      if (result.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.ticket_id === ticketId ? { ...b, status: "cancelled" } : b
          )
        );
        setSuccessMessage("Booking cancelled successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to cancel booking: " + result.message);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Error cancelling booking");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert("No bookings to export");
      return;
    }

    const headers = [
      "Ticket ID",
      "Movie",
      "User ID",
      "Username",
      "Email",
      "Seat",
      "Show Date",
      "Show Time",
      "Cinema",
      "Price Paid",
      "Status",
      "Created At",
    ];
    const rows = filteredBookings.map((b) => [
      b.ticket_id,
      b.movie_title,
      b.user_id,
      b.username,
      b.user_email,
      b.seat_number,
      new Date(b.show_date).toLocaleDateString(),
      b.show_time,
      b.cinema_name,
      `$${parseFloat(b.price_paid || 0).toFixed(2)}`,
      b.status,
      new Date(b.created_at).toLocaleString(),
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique movies and users for filter dropdowns
  const uniqueMovies = [...new Set(bookings.map((b) => b.movie_title))]
    .filter(Boolean)
    .sort();
  const uniqueUsers = Array.from(
    new Map(
      bookings.map((b) => [
        b.user_id,
        {
          id: b.user_id,
          username: b.username,
          email: b.user_email,
        },
      ])
    ).values()
  ).sort((a, b) => a.username.localeCompare(b.username));

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Get concession icon
  const getConcessionIcon = (category) => {
    switch (category) {
      case "popcorn":
        return "🍿";
      case "drink":
        return "🥤";
      case "combo":
        return "🍔";
      case "snack":
        return "🍟";
      case "candy":
        return "🍬";
      default:
        return "🍿";
    }
  };

  if (loading) {
    return (
      <div className="management-tab booking-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="management-tab booking-management">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-tab booking-management">
      {/* Success Message */}
      {successMessage && (
        <div className="message success">{successMessage}</div>
      )}

      {/* Error Message */}
      {error && <div className="message error">{error}</div>}

      {/* Header */}
      <div className="tab-header">
        <h2>🎟️ Booking Management</h2>
        <button className="btn-add" onClick={handleExportCSV}>
          📥 Export CSV
        </button>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <h3>📊 Booking Analytics</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon">🎟️</div>
            <div className="analytics-content">
              <h4>Total Bookings</h4>
              <p className="analytics-value">{analytics.totalBookings}</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">💰</div>
            <div className="analytics-content">
              <h4>Total Revenue</h4>
              <p className="analytics-value">
                ${analytics.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">✅</div>
            <div className="analytics-content">
              <h4>Paid Bookings</h4>
              <p className="analytics-value">{analytics.paidBookings}</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">❌</div>
            <div className="analytics-content">
              <h4>Cancelled</h4>
              <p className="analytics-value">{analytics.cancelledBookings}</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">📈</div>
            <div className="analytics-content">
              <h4>Avg Revenue/Booking</h4>
              <p className="analytics-value">
                ${analytics.avgRevenuePerBooking.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon">🍿</div>
            <div className="analytics-content">
              <h4>Concessions Total</h4>
              <p className="analytics-value">
                ${analytics.totalConcessions.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h3>🔍 Filter Bookings</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Filter by Show Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Filter by Movie</label>
            <select
              value={filterMovie}
              onChange={(e) => setFilterMovie(e.target.value)}
              className="filter-select"
            >
              <option value="">All Movies</option>
              {uniqueMovies.map((movie) => (
                <option key={movie} value={movie}>
                  {movie}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="filter-select"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            className="btn-filter-reset"
            onClick={() => {
              setFilterDate("");
              setFilterMovie("");
              setFilterUser("");
              setFilterStatus("");
            }}
          >
            🔄 Reset Filters
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bookings-section">
        <h3>
          📋 Bookings ({filteredBookings.length}/{bookings.length})
        </h3>

        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings found matching your filters.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Movie</th>
                  <th>User</th>
                  <th>Seat</th>
                  <th>Show Date</th>
                  <th>Show Time</th>
                  <th>Cinema</th>
                  <th>Price Paid</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.ticket_id} className="booking-row">
                    <td>{booking.ticket_id}</td>
                    <td className="movie-cell">{booking.movie_title}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <strong>{booking.username}</strong>
                        <small style={{ color: "#888" }}>
                          {booking.user_email}
                        </small>
                      </div>
                    </td>
                    <td className="seat-cell">{booking.seat_number}</td>
                    <td>{formatDate(booking.show_date)}</td>
                    <td>{formatTime(booking.show_time)}</td>
                    <td>{booking.cinema_name}</td>
                    <td className="price-cell">
                      ${parseFloat(booking.price_paid || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {new Date(booking.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="actions-cell">
                      {booking.status !== "cancelled" && (
                        <button
                          className="btn-cancel-booking"
                          onClick={() => handleCancelBooking(booking.ticket_id)}
                          title="Cancel this booking"
                        >
                          ❌ Cancel
                        </button>
                      )}
                      {booking.status === "cancelled" && (
                        <span className="action-disabled">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Concessions Detail */}
      {filteredBookings.length > 0 && (
        <div className="concessions-detail">
          <h3>🍿 Concessions Summary</h3>
          <div className="concessions-list">
            {filteredBookings
              .filter(
                (booking) =>
                  booking.concessions && booking.concessions.length > 0
              )
              .map((booking) => (
                <div key={booking.ticket_id} className="concession-detail">
                  <strong>
                    Ticket #{booking.ticket_id} - {booking.movie_title} (
                    {booking.username})
                  </strong>
                  <ul>
                    {booking.concessions.map((c, idx) => (
                      <li key={idx}>
                        {getConcessionIcon(c.category)} {c.name} x{c.quantity} -
                        ${(c.price * c.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            {filteredBookings.filter(
              (b) => b.concessions && b.concessions.length > 0
            ).length === 0 && (
              <div className="empty-state">
                <p>No concessions purchased with these bookings.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingManagement;
