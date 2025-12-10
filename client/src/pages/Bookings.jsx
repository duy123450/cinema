import { useState, useEffect, useContext } from "react";
import { apiService } from "../services/api";
import { Link, useSearchParams } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";

function Bookings() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching bookings for user:", user.user_id); // Debug log
        const data = await apiService.getBookings(user.user_id);
        console.log("Bookings data received:", data); // Debug log
        
        // Handle case where backend returns HTML error with JSON
        if (typeof data === 'string') {
          // Try to extract JSON from the string
          const jsonMatch = data.match(/\[{.*}\]/);
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            setBookings(Array.isArray(parsedData) ? parsedData : []);
          } else {
            setBookings([]);
            setError("Failed to parse bookings data.");
          }
        } else if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setBookings([]);
        }

        // Check for success message from URL parameter
        if (searchParams.get('success') === 'true') {
          setSuccessMessage("Ticket booked successfully! 🎉");
          setTimeout(() => setSuccessMessage(""), 5000);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings. Please try again.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, searchParams]);

  const handleCancelBooking = async (ticketId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await apiService.cancelBooking(ticketId);
      // Refresh bookings
      const data = await apiService.getBookings(user.user_id);
      setBookings(data);
      alert("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "status-paid";
      case "booked": return "status-booked";
      case "cancelled": return "status-cancelled";
      default: return "status-default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "paid": return "✅ Confirmed";
      case "booked": return "🎟️ Reserved";
      case "cancelled": return "❌ Cancelled";
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getConcessionIcon = (category) => {
    switch (category) {
      case 'popcorn': return '🍿';
      case 'drink': return '🥤';
      case 'combo': return '🍔';
      case 'snack': return '🍟';
      case 'candy': return '🍬';
      default: return '🍿';
    }
  };

  if (loading) {
    return (
      <div className="page bookings-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page bookings-page">
        <div className="error-container">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your bookings.</p>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page bookings-page">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p className="bookings-subtitle">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} found
        </p>
      </div>

      {successMessage && (
        <div className="success-message-banner">
          {successMessage}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">🎟️</div>
          <h2>No bookings yet</h2>
          <p>You haven't booked any tickets. Start exploring movies!</p>
          <Link to="/movies" className="btn-primary">Browse Movies</Link>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
  <div key={booking.ticket_id} className="booking-card">
    <div className="booking-header">
      <div className="booking-movie-info">
        {booking.poster_url && (
          <img 
            src={booking.poster_url} 
            alt={booking.movie_title} 
            className="booking-poster"
          />
        )}
        <div className="booking-title-section">
          <h3 className="booking-movie-title">{booking.movie_title}</h3>
          <span className={`booking-status ${getStatusColor(booking.status)}`}>
            {getStatusLabel(booking.status)}
          </span>
        </div>
      </div>
    </div>

    <div className="booking-details">
      <div className="booking-detail-item">
        <span className="detail-icon">🏢</span>
        <div className="detail-content">
          <span className="detail-label">Cinema</span>
          <span className="detail-value">{booking.cinema_name}</span>
        </div>
      </div>

      <div className="booking-detail-item">
        <span className="detail-icon">📍</span>
        <div className="detail-content">
          <span className="detail-label">Location</span>
          <span className="detail-value">{booking.city}</span>
        </div>
      </div>

      <div className="booking-detail-item">
        <span className="detail-icon">📺</span>
        <div className="detail-content">
          <span className="detail-label">Screen</span>
          <span className="detail-value">{booking.screen_number}</span>
        </div>
      </div>

      <div className="booking-detail-item">
        <span className="detail-icon">📅</span>
        <div className="detail-content">
          <span className="detail-label">Date</span>
          <span className="detail-value">{formatDate(booking.show_date)}</span>
        </div>
      </div>

      <div className="booking-detail-item">
        <span className="detail-icon">🕐</span>
        <div className="detail-content">
          <span className="detail-label">Time</span>
          <span className="detail-value time">{formatTime(booking.show_time)}</span>
        </div>
      </div>

      <div className="booking-detail-item">
        <span className="detail-icon">💺</span>
        <div className="detail-content">
          <span className="detail-label">Seat</span>
          <span className="detail-value seat">{booking.seat_number}</span>
        </div>
      </div>

      <div className="booking-detail-item">
        <span className="detail-icon">🎫</span>
        <div className="detail-content">
          <span className="detail-label">Ticket Type</span>
          <span className="detail-value">{booking.ticket_type}</span>
        </div>
      </div>

      {/* NEW: Show Concessions if they exist */}
      {booking.concessions && booking.concessions.length > 0 && (
        <div className="booking-detail-item highlight concessions-item">
          <span className="detail-icon">🍿</span>
          <div className="detail-content">
            <span className="detail-label">Concessions</span>
            <div className="concessions-list">
              {booking.concessions.map((item, index) => (
                <div key={index} className="concession-entry">
                  <span>{item.quantity}× {item.name}</span>
                  <span className="concession-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="booking-detail-item highlight">
        <span className="detail-icon">💰</span>
        <div className="detail-content">
          <span className="detail-label">Total Paid</span>
          <span className="detail-value price">${booking.price_paid}</span>
        </div>
      </div>
    </div>

    <div className="booking-actions">
      <Link 
        to={`/movies/${booking.movie_id || ''}`} 
        className="btn-view-movie"
      >
        View Movie
      </Link>
      
      {booking.status !== 'cancelled' && (
        <button 
          onClick={() => handleCancelBooking(booking.ticket_id)}
          className="btn-cancel-booking"
        >
          Cancel Booking
        </button>
      )}
    </div>

    <div className="booking-footer">
      <span className="booking-id">Booking ID: #{booking.ticket_id}</span>
      <span className="booking-date">
        Booked on {new Date(booking.created_at).toLocaleDateString()}
      </span>
    </div>
  </div>
))}
      </div>
        )}
    </div>
  );
}

export default Bookings;