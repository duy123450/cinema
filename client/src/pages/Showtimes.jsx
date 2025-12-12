import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Link, useSearchParams } from "react-router-dom";

function Showtimes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters - Get initial values from URL params
  const [selectedMovie, setSelectedMovie] = useState(
    searchParams.get("movie") || "all"
  );
  const [selectedCinema, setSelectedCinema] = useState(
    searchParams.get("cinema") || "all"
  );
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || ""
  );

  useEffect(() => {
    // Fetch movies and cinemas on mount
    const fetchMeta = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both now_showing and upcoming movies (exclude ended via backend)
        const [nowShowingMovies, upcomingMovies, cinemasData] =
          await Promise.all([
            apiService.getMovies("now_showing"),
            apiService.getMovies("upcoming"),
            apiService.getCinemas(),
          ]);
        const moviesData = [...nowShowingMovies, ...upcomingMovies];

        setMovies(moviesData || []);
        // store cinema names for select
        setShowtimes((prev) => prev); // noop to keep lint happy
        // Save cinemas in local state by mapping names
        setCinemas(cinemasData || []);
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setError("Failed to load movies/cinemas.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedMovie !== "all") params.set("movie", selectedMovie);
    if (selectedCinema !== "all") params.set("cinema", selectedCinema);
    if (selectedDate) params.set("date", selectedDate);

    setSearchParams(params, { replace: true });

    // Fetch showtimes from server when filters change
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {};
        if (selectedMovie !== "all") filters.movieId = selectedMovie;
        if (selectedCinema !== "all") filters.cinemaId = selectedCinema;
        if (selectedDate) filters.date = selectedDate;

        const data = await apiService.getShowtimes(filters);
        setShowtimes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching showtimes:", err);
        setError("Failed to load showtimes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [selectedMovie, selectedCinema, selectedDate, setSearchParams]);

  // Filter showtimes based on selected criteria and movie status
  const filteredShowtimes = showtimes.filter((showtime) => {
    // Only show showtimes for movies in the active movies list (now_showing + upcoming)
    const movieExists = movies.some((m) => m.movie_id === showtime.movie_id);

    const movieMatch =
      selectedMovie === "all" || showtime.movie_id === parseInt(selectedMovie);
    const cinemaMatch =
      selectedCinema === "all" || showtime.cinema_name === selectedCinema;
    const dateMatch = !selectedDate || showtime.show_date === selectedDate;

    return movieExists && movieMatch && cinemaMatch && dateMatch;
  });

  // Group showtimes by date
  const groupedShowtimes = filteredShowtimes.reduce((acc, showtime) => {
    const date = showtime.show_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(showtime);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedShowtimes).sort();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="page showtimes-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading showtimes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page showtimes-page">
      <div className="showtimes-header">
        <h1>Movie Showtimes</h1>
        <p className="showtimes-subtitle">
          {filteredShowtimes.length}{" "}
          {filteredShowtimes.length === 1 ? "showtime" : "showtimes"} available
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="showtimes-filters">
        <div className="filter-group">
          <label htmlFor="movie-filter">🎬 Movie</label>
          <select
            id="movie-filter"
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Movies</option>
            {movies.map((movie) => (
              <option key={movie.movie_id} value={movie.movie_id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="cinema-filter">🏢 Cinema</label>
          <select
            id="cinema-filter"
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Cinemas</option>
            {cinemas.map((cinema) => (
              <option
                key={cinema.cinema_id || cinema.id}
                value={cinema.cinema_id || cinema.id}
              >
                {cinema.name ||
                  cinema.cinema_name ||
                  `Cinema ${cinema.cinema_id || cinema.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date-filter">📅 Date</label>
          <input
            type="date"
            id="date-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-select"
          />
        </div>

        <button
          className="btn-reset-filters"
          onClick={() => {
            setSelectedMovie("all");
            setSelectedCinema("all");
            setSelectedDate("");
            setSearchParams({}, { replace: true });
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Showtimes List */}
      {filteredShowtimes.length === 0 ? (
        <div className="no-showtimes">
          <p>No showtimes found matching your criteria.</p>
        </div>
      ) : (
        <div className="showtimes-list">
          {sortedDates.map((date) => (
            <div key={date} className="showtime-date-group">
              <h2 className="date-header">{formatDate(date)}</h2>
              <div className="showtimes-grid">
                {groupedShowtimes[date].map((showtime) => (
                  <div key={showtime.showtime_id} className="showtime-card">
                    <div className="showtime-movie-info">
                      <h3 className="movie-title">{showtime.title}</h3>
                      <div className="movie-meta">
                        <span className="duration">
                          ⏱️ {showtime.duration_minutes} min
                        </span>
                        <span className="rating">🎫 {showtime.rating}</span>
                      </div>
                    </div>

                    <div className="showtime-details">
                      <div className="detail-item">
                        <span className="label">🏢 Cinema:</span>
                        <span className="value">{showtime.cinema_name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">📺 Screen:</span>
                        <span className="value">
                          {showtime.screen_number} ({showtime.screen_type})
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">🕐 Time:</span>
                        <span className="value time">
                          {formatTime(showtime.show_time)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">💺 Available:</span>
                        <span className="value seats">
                          {showtime.available_seats} seats
                        </span>
                      </div>
                      <div className="detail-item price-item">
                        <span className="label">💰 Price:</span>
                        <span className="value price">${showtime.price}</span>
                      </div>
                    </div>

                    <Link
                      to={`/buy-tickets?showtime=${showtime.showtime_id}`}
                      className="btn-book-showtime"
                    >
                      Book Now
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Showtimes;
