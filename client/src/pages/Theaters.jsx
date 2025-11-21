import React from "react";

function Theaters() {
  return (
    <div className="page">
      <h1>Cinemas Near You</h1>
      <div className="theater-grid">
        <div className="theater-card">
          <h3>Downtown Cinema</h3>
          <p>123 Main St, City Center</p>
          <p>5 screens • Premium sound</p>
          <button className="btn-primary">View Shows</button>
        </div>
        <div className="theater-card">
          <h3>Plaza Theater</h3>
          <p>456 Oak Ave, Shopping Mall</p>
          <p>8 screens • IMAX available</p>
          <button className="btn-primary">View Shows</button>
        </div>
      </div>
    </div>
  );
}

export default Theaters;
