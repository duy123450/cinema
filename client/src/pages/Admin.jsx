import React from "react";
import { Link } from "react-router-dom";

function Admin() {
  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="admin-grid">
        <Link to="/admin/movies" className="admin-card">
          <h3>Manage Movies</h3>
          <p>Add, edit, remove movies</p>
        </Link>
        <Link to="/admin/showtimes" className="admin-card">
          <h3>Manage Showtimes</h3>
          <p>Schedule movies in theaters</p>
        </Link>
        <Link to="/admin/users" className="admin-card">
          <h3>Manage Users</h3>
          <p>View and manage accounts</p>
        </Link>
        <Link to="/admin/tickets" className="admin-card">
          <h3>Manage Tickets</h3>
          <p>View bookings and sales</p>
        </Link>
      </div>
    </div>
  );
}

export default Admin;
