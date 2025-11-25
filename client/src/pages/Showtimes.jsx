import { useState, useEffect } from "react";
import { apiService } from "../services/api";

function Showtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const data = await apiService.getShowtimes();
        setShowtimes(data);
      } catch (error) {
        console.error("Error fetching showtimes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, []);

  if (loading) return <div className="page">Loading showtimes...</div>;

  return (
    <div className="page">
      <h1>Showtimes</h1>
      <div className="showtime-list">
        {showtimes.map((showtime) => (
          <div key={showtime.showtime_id} className="showtime-card">
            <h3>{showtime.title}</h3>
            <p>Cinema: {showtime.cinema_name}</p>
            <p>Screen: {showtime.screen_number}</p>
            <p>Date: {showtime.show_date}</p>
            <p>Time: {showtime.show_time}</p>
            <p>Price: ${showtime.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Showtimes;
