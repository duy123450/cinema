import React from "react";

function Bookings() {
  return (
    <div className="page">
      <h1>My Bookings</h1>
      <div className="booking-list">
        <div className="booking-card">
          <h3>Spider-Man: Across the Spider-Verse</h3>
          <p>Cinema: Downtown • Screen: 3 • Seats: A12, A13</p>
          <p>Date: Nov 22, 2025 • Time: 7:00 PM</p>
          <button className="btn-secondary">View Ticket</button>
        </div>
      </div>
    </div>
  );
}

export default Bookings;
