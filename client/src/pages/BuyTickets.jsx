import { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import AuthContext from "../contexts/AuthContext";

function BuyTickets() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Booking flow state
  const [step, setStep] = useState(1);
  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [concessions, setConcessions] = useState([]);
  const [selectedConcessions, setSelectedConcessions] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const showtimeId = searchParams.get("showtime");
    if (!showtimeId) {
      navigate("/showtimes");
      return;
    }

    fetchBookingData(showtimeId);
  }, [searchParams, navigate]);

  const fetchBookingData = async (showtimeId) => {
    try {
      setLoading(true);

      // FIXED: Get showtime details first
      const showtimeData = await apiService.getShowtimeById(showtimeId);

      console.log("Showtime data received:", showtimeData); // DEBUG

      if (!showtimeData) {
        setError("Showtime not found");
        setLoading(false);
        return;
      }

      // Ensure we have the showtime_id
      if (!showtimeData.showtime_id) {
        console.error("Showtime data missing showtime_id:", showtimeData);
        setError("Invalid showtime data");
        setLoading(false);
        return;
      }

      const [concessionsData, promotionsData] = await Promise.all([
        apiService.getConcessions(),
        apiService.getPromotions(),
      ]);

      setShowtime(showtimeData);
      setConcessions(concessionsData);
      setPromotions(promotionsData || []);
    } catch (err) {
      console.error("Error fetching booking data:", err);
      setError("Failed to load booking information: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Seat selection handlers
  const handleSeatSelect = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Concession handlers
  const handleConcessionAdd = (concession) => {
    const existing = selectedConcessions.find(
      (c) => c.concession_id === concession.concession_id
    );
    if (existing) {
      setSelectedConcessions(
        selectedConcessions.map((c) =>
          c.concession_id === concession.concession_id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      setSelectedConcessions([
        ...selectedConcessions,
        { ...concession, quantity: 1 },
      ]);
    }
  };

  const handleConcessionRemove = (concessionId) => {
    const existing = selectedConcessions.find(
      (c) => c.concession_id === concessionId
    );
    if (existing && existing.quantity > 1) {
      setSelectedConcessions(
        selectedConcessions.map((c) =>
          c.concession_id === concessionId
            ? { ...c, quantity: c.quantity - 1 }
            : c
        )
      );
    } else {
      setSelectedConcessions(
        selectedConcessions.filter((c) => c.concession_id !== concessionId)
      );
    }
  };

  // Calculate totals
  const ticketTotal = selectedSeats.length * (showtime?.price || 0);
  const concessionsTotal = selectedConcessions.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const subtotal = ticketTotal + concessionsTotal;

  // Ensure discountAmount is always a number
  let discountAmount = 0;
  if (selectedPromotion) {
    if (selectedPromotion.discount_type === "percentage") {
      discountAmount =
        (subtotal * parseFloat(selectedPromotion.discount_value)) / 100;
    } else {
      discountAmount = parseFloat(selectedPromotion.discount_value) || 0;
    }
  }

  const total = subtotal - discountAmount;

  // Handle booking submission
  const handleConfirmBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // DEBUG: Check showtime object
    console.log("Full showtime object:", showtime);
    console.log("Showtime ID value:", showtime?.showtime_id);
    console.log("Selected seats:", selectedSeats);

    if (!showtime) {
      setError("Showtime information is missing");
      return;
    }

    if (!showtime.showtime_id) {
      setError("Showtime ID is missing - cannot proceed with booking");
      console.error("Invalid showtime object:", showtime);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create bookings for each seat
      const bookingPromises = selectedSeats.map((seat) => {
        const bookingData = {
          showtime_id: showtime.showtime_id,
          seat_number: seat,
          ticket_type: "adult",
        };

        console.log("Sending booking data:", bookingData); // DEBUG

        return apiService.createBooking(bookingData);
      });

      const results = await Promise.all(bookingPromises);

      console.log("All bookings created:", results);

      // Navigate to bookings page with success message
      navigate("/bookings?success=true");
    } catch (err) {
      console.error("Error creating booking:", err);

      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to complete booking";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showtime) {
    return (
      <div className="page ticket-booking-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page ticket-booking-page">
        <div className="error-container">
          <h2>Booking Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/showtimes")}
            className="btn-primary"
          >
            Back to Showtimes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page ticket-booking-page">
      {/* Progress Steps */}
      <div className="booking-progress">
        <div
          className={`progress-step ${step >= 1 ? "active" : ""} ${
            step > 1 ? "completed" : ""
          }`}
        >
          <div className="step-number">1</div>
          <span>Select Seats</span>
        </div>
        <div
          className={`progress-step ${step >= 2 ? "active" : ""} ${
            step > 2 ? "completed" : ""
          }`}
        >
          <div className="step-number">2</div>
          <span>Add Concessions</span>
        </div>
        <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span>Confirm & Pay</span>
        </div>
      </div>

      {/* Movie Info Header */}
      {showtime && (
        <div className="booking-header">
          <h2>{showtime.title}</h2>
          <div className="booking-details">
            <span>📅 {new Date(showtime.show_date).toLocaleDateString()}</span>
            <span>🕐 {showtime.show_time}</span>
            <span>🏢 {showtime.cinema_name}</span>
            <span>📺 {showtime.screen_number}</span>
          </div>
        </div>
      )}

      {/* Step 1: Seat Selection */}
      {step === 1 && (
        <div className="booking-step seat-selection-step">
          <h3>Select Your Seats</h3>
          <div className="seat-grid">
            {["A", "B", "C", "D", "E", "F"].map((row) => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const seatId = `${row}${num}`;
                  const isSelected = selectedSeats.includes(seatId);
                  return (
                    <button
                      key={seatId}
                      className={`seat ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSeatSelect(seatId)}
                      title={
                        isSelected
                          ? `Seat ${seatId} - Selected`
                          : `Seat ${seatId} - Available`
                      }
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat available"></div>
              <span>Available (Green)</span>
            </div>
            <div className="legend-item">
              <div className="seat choosing"></div>
              <span>Hovering (Yellow)</span>
            </div>
            <div className="legend-item">
              <div className="seat selected"></div>
              <span>Selected (Red)</span>
            </div>
          </div>

          <div className="step-actions">
            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={selectedSeats.length === 0}
            >
              Continue to Concessions ({selectedSeats.length}{" "}
              {selectedSeats.length === 1 ? "seat" : "seats"})
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Concessions */}
      {step === 2 && (
        <div className="booking-step concessions-step">
          <h3>Add Concessions (Optional)</h3>

          <div className="concessions-categories">
            {["combo", "popcorn", "drink", "snack", "candy"].map((category) => (
              <div key={category} className="category-section">
                <h4>{category.charAt(0).toUpperCase() + category.slice(1)}s</h4>
                <div className="concessions-grid">
                  {concessions
                    .filter((c) => c.category === category)
                    .map((concession) => (
                      <div
                        key={concession.concession_id}
                        className="concession-card"
                      >
                        <h5>{concession.name}</h5>
                        <p className="concession-description">
                          {concession.description}
                        </p>
                        <p className="concession-price">
                          ${parseFloat(concession.price).toFixed(2)}
                        </p>
                        <button
                          className="btn-add-concession"
                          onClick={() => handleConcessionAdd(concession)}
                        >
                          Add +
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {selectedConcessions.length > 0 && (
            <div className="selected-concessions">
              <h4>Your Concessions</h4>
              {selectedConcessions.map((item) => (
                <div key={item.concession_id} className="concession-item">
                  <span>{item.name}</span>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleConcessionRemove(item.concession_id)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleConcessionAdd(item)}>+</button>
                  </div>
                  <span>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Back to Seats
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm & Pay */}
      {step === 3 && (
        <div className="booking-step confirmation-step">
          <h3>Confirm Your Booking</h3>

          <div className="booking-summary">
            <div className="summary-section">
              <h4>Tickets</h4>
              <div className="summary-item">
                <span>
                  {selectedSeats.length} × Seats ({selectedSeats.join(", ")})
                </span>
                <span>${ticketTotal.toFixed(2)}</span>
              </div>
            </div>

            {selectedConcessions.length > 0 && (
              <div className="summary-section">
                <h4>Concessions</h4>
                {selectedConcessions.map((item) => (
                  <div key={item.concession_id} className="summary-item">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="summary-section">
              <h4>Apply Discount</h4>
              <select
                className="promotion-select"
                value={selectedPromotion?.promotion_id || ""}
                onChange={(e) => {
                  const promo = promotions.find(
                    (p) => p.promotion_id === parseInt(e.target.value)
                  );
                  setSelectedPromotion(promo || null);
                }}
              >
                <option value="">No discount</option>
                {promotions &&
                  promotions.length > 0 &&
                  promotions.map((promo) => (
                    <option key={promo.promotion_id} value={promo.promotion_id}>
                      {promo.title} -{" "}
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_value}% OFF`
                        : `$${promo.discount_value} OFF`}{" "}
                      (Code: {promo.code})
                    </option>
                  ))}
              </select>
            </div>

            <div className="summary-totals">
              <div className="total-row subtotal">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="total-row discount">
                  <span>Discount ({selectedPromotion?.title}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Back to Concessions
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirmBooking}
              disabled={loading}
            >
              {loading ? "Processing..." : `Confirm & Pay $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyTickets;
