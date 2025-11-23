import { useState, useEffect } from "react";
import { api } from "../services/api";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await api.getMovies();
        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div className="page">Loading movies...</div>;

  return (
    <div className="page">
      <h1>Movies</h1>
      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie.movie_id} className="movie-card">
            <h3>{movie.title}</h3>
            <p>{movie.description}</p>
            <p>Duration: {movie.duration_minutes} min</p>
            <p>Rating: {movie.rating}</p>
            <p>Release: {movie.release_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Movies;
