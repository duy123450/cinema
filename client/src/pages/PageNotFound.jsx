import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="page-not-found">
      <div className="error-container">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message-404">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn-index">
            Go Home
          </Link>
          <Link to="/movies" className="btn-movies">
            Browse Movies
          </Link>
          <Link to="/showtimes" className="btn-showtimes">
            View Showtimes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
