import { useState, useEffect } from "react";
import { apiService } from "../services/api";

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  });

  // Fetch all bookings
  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch bookings - this gets current user's bookings
        // For admin, we need a different endpoint or fetch all users
        const bookingsData = await apiService.getBookings();

        // If bookingsData is an array, use it directly
        const bookingsList = Array.isArray(bookingsData) ? bookingsData : [];
        setBookings(bookingsList);
        setFilteredBookings(bookingsList);

        // Calculate analytics
        calculateAnalytics(bookingsList);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, []);

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

    setAnalytics({
      totalBookings,
      totalRevenue,
      paidBookings,
      cancelledBookings,
      avgRevenuePerBooking,
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = bookings;

    if (filterDate) {
      filtered = filtered.filter(
        (b) => new Date(b.created_at).toLocaleDateString() === filterDate
      );
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
          b.username?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    setFilteredBookings(filtered);
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
        alert("Booking cancelled successfully!");
      } else {
        alert("Failed to cancel booking: " + result.message);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Error cancelling booking");
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
      "Seat",
      "Date",
      "Time",
      "Price Paid",
      "Status",
      "Created At",
      "Cinema",
    ];
    const rows = filteredBookings.map((b) => [
      b.ticket_id,
      b.movie_title,
      b.user_id,
      b.seat_number,
      new Date(b.show_date).toLocaleDateString(),
      b.show_time,
      `$${parseFloat(b.price_paid || 0).toFixed(2)}`,
      b.status,
      new Date(b.created_at).toLocaleString(),
      b.cinema_name,
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
  };

  // Get unique movies and users for filter dropdowns
  const uniqueMovies = [...new Set(bookings.map((b) => b.movie_title))];
  const uniqueUsers = [...new Set(bookings.map((b) => b.user_id))];

  if (loading) {
    return (
      <div className="management-tab">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="management-tab">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-tab booking-management">
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
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h3>🔍 Filter Bookings</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Filter by Date</label>
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
            <label>Filter by User ID</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="filter-select"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((userId) => (
                <option key={userId} value={userId}>
                  User {userId}
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
                  <th>User ID</th>
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
                    <td>{booking.user_id}</td>
                    <td className="seat-cell">{booking.seat_number}</td>
                    <td>{new Date(booking.show_date).toLocaleDateString()}</td>
                    <td>{booking.show_time}</td>
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
            {filteredBookings.map(
              (booking) =>
                booking.concessions &&
                booking.concessions.length > 0 && (
                  <div key={booking.ticket_id} className="concession-detail">
                    <strong>Ticket #{booking.ticket_id}:</strong>
                    <ul>
                      {booking.concessions.map((c, idx) => (
                        <li key={idx}>
                          {c.name} x{c.quantity} - $
                          {(c.price * c.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingManagement;
