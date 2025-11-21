import React, { useState, useEffect } from "react";

function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const movies = [
    {
      id: 1,
      title: "TENSURA MOVIE 2",
      tagline: "THE SLIME RETURNS — STRONGER, WISER, UNSTOPPABLE!",
      cast: ["Rimuru Tempest", "Benimaru", "Shion", "Hiiro", "Veldora"],
      showtimes: "SPECIAL SCREENING FROM 18:00 ON NOV 22 & DAILY FROM NOV 23",
      release: "IN THEATERS WORLDWIDE — NOV 25, 2025",
      rating: "Rated PG-13 • Action • Fantasy • Adventure",
      image:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDBxMHx8fHx8&auto=format&fit=crop&w=2000&q=80",
      buttonLabel: "Book Tickets",
    },
    {
      id: 2,
      title: "SPIDER-MAN: ACROSS THE SPIDER-VERSE",
      tagline: "EVERY UNIVERSE. ONE HERO.",
      cast: ["Miles Morales", "Gwen Stacy", "Spider-Gwen", "Spider-Man 2099"],
      showtimes: "NOW PLAYING — ALL SHOWTIMES AVAILABLE",
      release: "IN THEATERS NOW",
      rating: "Rated PG • Animation • Action • Adventure",
      image:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDBxMHx8fHx8&auto=format&fit=crop&w=2000&q=80",
      buttonLabel: "View Showtimes",
    },
    {
      id: 3,
      title: "DUNE: PART TWO",
      tagline: "THE DESTINY OF THE UNIVERSE IS IN HIS HANDS.",
      cast: [
        "Timothée Chalamet",
        "Zendaya",
        "Rebecca Ferguson",
        "Austin Butler",
      ],
      showtimes: "LIMITED IMAX SHOWINGS — BOOK EARLY",
      release: "IN THEATERS NOW",
      rating: "Rated PG-13 • Sci-Fi • Action • Drama",
      image:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDBxMHx8fHx8&auto=format&fit=crop&w=2000&q=80",
      buttonLabel: "Buy Tickets",
    },
    {
      id: 4,
      title: "OPPENHEIMER",
      tagline: "THE MAN WHO CHANGED THE WORLD.",
      cast: [
        "Cillian Murphy",
        "Robert Downey Jr.",
        "Matt Damon",
        "Emily Blunt",
      ],
      showtimes: "SELECT THEATERS — LIMITED ENGAGEMENT",
      release: "NOW SHOWING",
      rating: "Rated R • Biography • Drama • History",
      image:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDBxMHx8fHx8&auto=format&fit=crop&w=2000&q=80",
      buttonLabel: "Watch Trailer",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentMovie = movies[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
  };

  const goToPrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + movies.length) % movies.length
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="banner-slider">
      <img
        src={currentMovie.image}
        alt={currentMovie.title}
        className="banner-image"
      />

      <div className="banner-card">
        <h1>{currentMovie.title}</h1>
        <p className="tagline">{currentMovie.tagline}</p>

        <div className="cast-tags">
          {currentMovie.cast.map((actor, index) => (
            <span key={index} className="cast-tag">
              {actor}
            </span>
          ))}
        </div>

        <div className="showtimes">
          <p>{currentMovie.showtimes}</p>
          <p>{currentMovie.release}</p>
        </div>

        <div className="rating-and-button">
          <span className="rating">{currentMovie.rating}</span>
          <button className="btn-banner">{currentMovie.buttonLabel}</button>
        </div>
      </div>

      <button className="slider-arrow left" onClick={goToPrev}>
        ‹
      </button>
      <button className="slider-arrow right" onClick={goToNext}>
        ›
      </button>

      <div className="slider-dots">
        {movies.map((_, index) => (
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