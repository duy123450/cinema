import { useState, useEffect } from "react";
import { apiService } from "../services/api";

function Cinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const data = await apiService.getCinemas(); // Uses the same endpoint as cinemas
        setCinemas(data);
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
        {cinemas.map((cinema) => (
          <div key={cinema.cinema_id} className="theater-card">
            <h3>{cinema.name}</h3>
            <p>{cinema.address}</p>
            <p>
              {cinema.city}, {cinema.country}
            </p>
            <p>Screens: {cinema.total_screens}</p>
            <p>Seats: {cinema.total_seats}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cinemas;
