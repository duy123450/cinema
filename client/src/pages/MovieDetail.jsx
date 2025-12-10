import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import AuthContext from "../contexts/AuthContext";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [trailers, setTrailers] = useState([]);
  const [cast, setCast] = useState([]);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [trailerType, setTrailerType] = useState("all");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingMessage, setRatingMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch movie data, trailers, and cast
        const [movieData, trailersData, castData] = await Promise.all([
          apiService.getMovieById(id),
          apiService.getMovieTrailers(id),
          apiService.getMovieCast(id),
        ]);

        setMovie(movieData);
        setTrailers(trailersData);
        setCast(castData);

        // Fetch movie reviews
        fetchReviews();

        // Set the first featured or official trailer as selected
        const featured =
          trailersData.find((t) => t.is_featured) || trailersData[0];
        setSelectedTrailer(featured);

        // Fetch user's rating if logged in
        if (user) {
          const rating = await apiService.getUserMovieRating(id, user.user_id);
          if (rating) {
            setUserRating(rating);
          }
        }
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to load movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetail();
    }
  }, [id, user]);

  const fetchReviews = async () => {
    try {
      const reviewsData = await apiService.getMovieReviews(id);
      setReviews(reviewsData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      setRatingMessage("Please login to rate this movie");
      setTimeout(() => setRatingMessage(""), 3000);
      return;
    }

    try {
      await apiService.rateMovie(id, user.user_id, rating);
      setUserRating(rating);
      setRatingMessage("Rating saved successfully!");
      setTimeout(() => setRatingMessage(""), 3000);
      
      // Refresh reviews after rating
      fetchReviews();
    } catch (err) {
      console.error("Error saving rating:", err);
      setRatingMessage("Failed to save rating");
      setTimeout(() => setRatingMessage(""), 3000);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setRatingMessage("Please login to submit a review");
      setTimeout(() => setRatingMessage(""), 3000);
      return;
    }

    if (!userRating) {
      setRatingMessage("Please rate the movie first");
      setTimeout(() => setRatingMessage(""), 3000);
      return;
    }

    if (!reviewComment.trim()) {
      setRatingMessage("Please write a comment");
      setTimeout(() => setRatingMessage(""), 3000);
      return;
    }

    try {
      setReviewSubmitting(true);
      await apiService.submitReview(id, user.user_id, userRating, reviewComment);
      setReviewComment("");
      setRatingMessage("Review submitted successfully!");
      setTimeout(() => setRatingMessage(""), 3000);
      
      // Refresh reviews
      fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
      setRatingMessage("Failed to submit review");
      setTimeout(() => setRatingMessage(""), 3000);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredTrailers =
    trailerType === "all"
      ? trailers
      : trailers.filter((t) => t.trailer_type === trailerType);

  const getStatusColor = (status) => {
    switch (status) {
      case "now_showing":
        return "status-now-showing";
      case "upcoming":
        return "status-upcoming";
      case "ended":
        return "status-ended";
      default:
        return "status-default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "now_showing":
        return "Now Showing";
      case "upcoming":
        return "Coming Soon";
      case "ended":
        return "Ended";
      default:
        return status;
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^/&?]+)/
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="page movie-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page movie-detail-page">
        <div className="error-container">
          <h2>Movie Not Found</h2>
          <p>{error || "The movie you're looking for doesn't exist."}</p>
          <Link to="/movies" className="btn-back">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page movie-detail-page">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Back
      </button>

      <div className="movie-detail-container">
        {/* Movie Poster Section */}
        <div className="movie-poster-section">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="movie-poster-large"
            />
          ) : (
            <div className="poster-placeholder-large">
              <span>🎬</span>
            </div>
          )}
          <div className={`movie-status-badge ${getStatusColor(movie.status)}`}>
            {getStatusLabel(movie.status)}
          </div>
        </div>

        {/* Movie Info Section */}
        <div className="movie-info-section">
          <h1 className="movie-detail-title">{movie.title}</h1>

          {movie.original_title && movie.original_title !== movie.title && (
            <p className="movie-original-title">{movie.original_title}</p>
          )}

          {/* Rating Badge */}
          {movie.rating && (
            <div className="movie-rating-badge">
              <span className="rating-badge">{movie.rating}</span>
            </div>
          )}

          {/* User Rating Section */}
          <div className="user-rating-section">
            <h3 className="section-title">Rate This Movie</h3>
            <div className="star-rating">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <span
                  key={star}
                  className={`star ${
                    star <= (hoverRating || userRating) ? "filled" : ""
                  }`}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
              <span className="rating-value">
                {userRating || hoverRating || 0}/10
              </span>
            </div>
            {ratingMessage && <p className="rating-message">{ratingMessage}</p>}
          </div>

          {/* Movie Meta Info */}
          <div className="movie-meta-grid">
            {movie.release_date && (
              <div className="meta-item">
                <span className="meta-label">Release Date</span>
                <span className="meta-value">
                  📅 {new Date(movie.release_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {movie.duration_minutes && (
              <div className="meta-item">
                <span className="meta-label">Duration</span>
                <span className="meta-value">
                  ⏱️ {movie.duration_minutes} minutes
                </span>
              </div>
            )}

            {movie.genre && (
              <div className="meta-item">
                <span className="meta-label">Genre</span>
                <span className="meta-value">🎭 {movie.genre}</span>
              </div>
            )}

            {movie.director && (
              <div className="meta-item">
                <span className="meta-label">Director</span>
                <span className="meta-value">🎬 {movie.director}</span>
              </div>
            )}

            {movie.language && (
              <div className="meta-item">
                <span className="meta-label">Language</span>
                <span className="meta-value">🌐 {movie.language}</span>
              </div>
            )}

            {movie.imdb_rating && (
              <div className="meta-item">
                <span className="meta-label">IMDB Rating</span>
                <span className="meta-value imdb-score">
                  ⭐ {movie.imdb_rating}/10
                </span>
              </div>
            )}
          </div>

          {/* Cast Section */}
          {cast.length > 0 && (
            <div className="movie-cast-section">
              <h3 className="section-title">Cast</h3>
              <div className="cast-grid">
                {cast.map((member) => (
                  <Link
                    key={member.cast_id}
                    to={`/actors/${member.actor_id}`}
                    className="cast-member"
                  >
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="cast-image"
                      />
                    ) : (
                      <div className="cast-image-placeholder">👤</div>
                    )}
                    <div className="cast-info">
                      <p className="cast-name">{member.name}</p>
                      <p className="cast-character">{member.character_name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Trailers Section */}
          {trailers.length > 0 && (
            <div className="trailers-section">
              <h3 className="section-title">Trailers & Videos</h3>

              {/* Trailer Type Filter */}
              <div className="trailer-filters">
                <button
                  className={`filter-btn ${
                    trailerType === "all" ? "active" : ""
                  }`}
                  onClick={() => setTrailerType("all")}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${
                    trailerType === "official" ? "active" : ""
                  }`}
                  onClick={() => setTrailerType("official")}
                >
                  Official
                </button>
                <button
                  className={`filter-btn ${
                    trailerType === "teaser" ? "active" : ""
                  }`}
                  onClick={() => setTrailerType("teaser")}
                >
                  Teaser
                </button>
                <button
                  className={`filter-btn ${
                    trailerType === "behind_the_scenes" ? "active" : ""
                  }`}
                  onClick={() => setTrailerType("behind_the_scenes")}
                >
                  Behind the Scenes
                </button>
              </div>

              {/* Selected Trailer Player */}
              {selectedTrailer && (
                <div className="trailer-player">
                  <iframe
                    width="100%"
                    height="400"
                    src={getYouTubeEmbedUrl(selectedTrailer.url)}
                    title={selectedTrailer.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <p className="trailer-title">{selectedTrailer.title}</p>
                </div>
              )}

              {/* Trailer List */}
              <div className="trailer-list">
                {filteredTrailers.map((trailer) => (
                  <div
                    key={trailer.trailer_id}
                    className={`trailer-item ${
                      selectedTrailer?.trailer_id === trailer.trailer_id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setSelectedTrailer(trailer)}
                  >
                    <div className="trailer-thumbnail">
                      <img
                        src={`https://img.youtube.com/vi/${
                          trailer.url.match(
                            /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^/&?]+)/
                          )?.[1]
                        }/mqdefault.jpg`}
                        alt={trailer.title}
                      />
                      <div className="play-icon">▶</div>
                    </div>
                    <div className="trailer-info">
                      <p className="trailer-item-title">{trailer.title}</p>
                      <p className="trailer-type">
                        {trailer.trailer_type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {movie.description && (
            <div className="movie-description-section">
              <h3 className="section-title">Synopsis</h3>
              <p className="movie-description-full">{movie.description}</p>
            </div>
          )}

          {/* Reviews Section */}
          <div className="reviews-section">
            <h3 className="section-title">User Reviews ({reviews.length})</h3>

            {/* Submit Review Form */}
            {user && (
              <div className="submit-review-form">
                <h4>Write Your Review</h4>
                <form onSubmit={handleSubmitReview}>
                  <textarea
                    className="review-textarea"
                    placeholder="Share your thoughts about this movie..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows="4"
                    disabled={reviewSubmitting}
                  />
                  <button 
                    type="submit" 
                    className="btn-submit-review"
                    disabled={reviewSubmitting || !userRating}
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                  {!userRating && (
                    <p className="review-hint">Please rate the movie above before submitting your review</p>
                  )}
                </form>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.review_id} className="review-card">
                    <div className="review-header">
                      <div className="review-user-info">
                        <div className="review-avatar">
                          {review.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="review-username">{review.username}</p>
                          <p className="review-date">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="review-rating">
                        <div className="review-stars">
                          {[...Array(10)].map((_, i) => (
                            <span key={i} className={`star ${i < review.rating * 2 ? 'filled' : ''}`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="review-rating-value">{review.rating * 2}/10</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}
                    {review.is_verified_purchase && (
                      <span className="verified-badge">✓ Verified Ticket Holder</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this movie!</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="movie-actions">
            <Link to={`/showtimes?movie=${id}`} className="btn-showtimes">
              View Showtimes
            </Link>
            <Link to={`/showtimes?movie=${id}`} className="btn-book-tickets">
              Book Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;