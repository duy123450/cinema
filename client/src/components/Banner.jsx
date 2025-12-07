import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";

function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await apiService.getBanners();
        setBanners(data);
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Fallback to default banner if API fails
        setBanners([{
          id: 'default',
          type: 'movie',
          title: 'WELCOME TO CINEMA',
          tagline: 'YOUR PREMIER DESTINATION FOR MOVIES',
          cast: ['Action', 'Drama', 'Comedy', 'Thriller'],
          showtimes: 'NOW SHOWING',
          release: 'BOOK YOUR TICKETS TODAY',
          rating: 'All Genres Available',
          image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=2000&q=80',
          buttonLabel: 'View Movies',
          buttonLink: '/movies'
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + banners.length) % banners.length
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="banner-slider">
        <div className="banner-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="banner-slider">
      <img
        src={currentBanner.image}
        alt={currentBanner.title}
        className="banner-image"
      />

      <div className={`banner-card ${currentBanner.type === 'promotion' ? 'banner-promo' : ''}`}>
        {currentBanner.type === 'promotion' && (
          <div className="promo-badge">
            🎁 SPECIAL OFFER
          </div>
        )}
        
        <h1>{currentBanner.title}</h1>
        <p className="tagline">{currentBanner.tagline}</p>

        <div className="cast-tags">
          {currentBanner.cast.map((item, index) => (
            <span key={index} className="cast-tag">
              {item}
            </span>
          ))}
        </div>

        <div className="showtimes">
          <p>{currentBanner.showtimes}</p>
          <p>{currentBanner.release}</p>
        </div>

        <div className="rating-and-button">
          <span className="rating">{currentBanner.rating}</span>
          <Link to={currentBanner.buttonLink} className="btn-banner">
            {currentBanner.buttonLabel}
          </Link>
        </div>
      </div>

      <button className="slider-arrow left" onClick={goToPrev}>
        ‹
      </button>
      <button className="slider-arrow right" onClick={goToNext}>
        ›
      </button>

      <div className="slider-dots">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default BannerSlider;