import { useState, useEffect } from "react";
import { api } from "../services/api";

function Theaters() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const data = await api.getCinemas(); // Uses the same endpoint as cinemas
        setTheaters(data);
      } catch (error) {
        console.error("Error fetching theaters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  if (loading) return <div className="page">Loading theaters...</div>;

  return (
    <div className="page">
      <h1>Cinemas</h1>
      <div className="theater-grid">
        {theaters.map((theater) => (
          <div key={theater.cinema_id} className="theater-card">
            <h3>{theater.name}</h3>
            <p>{theater.address}</p>
            <p>
              {theater.city}, {theater.country}
            </p>
            <p>Screens: {theater.total_screens}</p>
            <p>Seats: {theater.total_seats}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Theaters;
