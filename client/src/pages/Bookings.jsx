import { useState, useEffect } from "react";
import { apiService } from "../services/api";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // For now, assume user ID 1 (replace with real auth later)
        const data = await apiService .getBookings(1); // 👈 Now using the API service
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="page">Loading your bookings...</div>;

  return (
    <div className="page">
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <p>You haven't booked any tickets yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.ticket_id} className="booking-card">
              <h3>{booking.movie_title}</h3>
              <p>
                <strong>Cinema:</strong> {booking.cinema_name}
              </p>
              <p>
                <strong>Screen:</strong> {booking.screen_number}
              </p>
              <p>
                <strong>Date & Time:</strong> {booking.show_date} at{" "}
                {booking.show_time}
              </p>
              <p>
                <strong>Seat:</strong> {booking.seat_number}
              </p>
              <p>
                <strong>Price:</strong> ${booking.price_paid}
              </p>
              <p>
                <strong>Status:</strong> {booking.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;
