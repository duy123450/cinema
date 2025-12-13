import { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import AuthContext from "../contexts/AuthContext";

function BuyTickets() {
  const [searchParams] = useSearchParams(); // Lấy query params từ URL
  const navigate = useNavigate();           // Điều hướng trang
  const { user } = useContext(AuthContext); // Lấy user hiện tại

  // ============= Booking flow state =============
  const [step, setStep] = useState(1);                                 // 3 bước: 1=Chọn ghế, 2=Bắp nước, 3=Thanh toán
  const [showtime, setShowtime] = useState(null);                      // Thông tin suất chiếu
  const [selectedSeats, setSelectedSeats] = useState([]);              // Ghế đang chọn: []
  const [bookedSeats, setBookedSeats] = useState([]);                  // Ghế đã bán: []
  const [concessions, setConcessions] = useState([]);                  // Danh sách bắp nước
  const [selectedConcessions, setSelectedConcessions] = useState([]);  // Bắp nước đang chọn
  const [promotions, setPromotions] = useState([]);                    // Danh sách khuyến mãi
  const [selectedPromotion, setSelectedPromotion] = useState(null);    // Khuyến mãi chọn

  // ============= UI STATE =============
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chạy khi component mount hoặc URL thay đổi
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

      // Gọi 4 API song song
      const [showtimeData, concessionsData, promotionsData, seatsData] =
        await Promise.all([
          apiService.getShowtimeById(showtimeId),
          apiService.getConcessions(),
          apiService.getPromotions(),
          apiService.getSeats(showtimeId),
        ]);

      if (!showtimeData) {
        setError("Showtime not found");
        setLoading(false);
        return;
      }

      // Lưu dữ liệu vào state
      setShowtime(showtimeData);
      setConcessions(concessionsData);
      setPromotions(promotionsData || []);
      if (seatsData && seatsData.success) {
        setBookedSeats(seatsData.bookedSeats || []);
      }
    } catch (err) {
      console.error("Error fetching booking data:", err);
      setError("Failed to load booking information: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Seat selection handlers
  const handleSeatSelect = (seat) => {
    // Nếu ghế đã bán, không cho chọn
    if (bookedSeats.includes(seat)) {
      return;
    }

    // Nếu ghế đang chọn, bỏ chọn
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Concession handlers
  const handleConcessionAdd = (concession) => {
    // Tìm xem bắp nước này đã có trong giỏ chưa
    const existing = selectedConcessions.find(
      (c) => c.concession_id === concession.concession_id
    );
    if (existing) {
      // Nếu có tăng số lượng lên 1
      setSelectedConcessions(
        selectedConcessions.map((c) =>
          c.concession_id === concession.concession_id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      // Nếu không thì thêm mới với số lượng = 1
      setSelectedConcessions([
        ...selectedConcessions,
        { ...concession, quantity: 1 },
      ]);
    }
  };

  // Bỏ bắp nước/ giảm số lượng
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

  //Tạo Booking
  const handleConfirmBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!showtime || !showtime.showtime_id) {
      setError("Showtime ID is missing - cannot proceed with booking");
      return;
    }

    if (selectedSeats.length === 0) {
      setError("Please select at least one seat");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Creating bookings for seats:", selectedSeats);
      console.log("Selected concessions:", selectedConcessions);
      console.log("Promotion:", selectedPromotion);

      // Create bookings for each seat
      const bookingPromises = selectedSeats.map(async (seat, index) => {
        const bookingData = {
          showtime_id: showtime.showtime_id,
          seat_number: seat,
          ticket_type: "adult",
          // ONLY attach concessions to the FIRST ticket to avoid duplicates
          // Each subsequent ticket will have an empty concessions array
          concessions: index === 0 && selectedConcessions.length > 0 
            ? selectedConcessions.map((c) => ({
                concession_id: c.concession_id,
                quantity: c.quantity,
                price: parseFloat(c.price),
              })) 
            : [],
          promotion_code: selectedPromotion?.code || null,
        };

        console.log(`Booking data for seat ${seat}:`, bookingData);
        return apiService.createBooking(bookingData);
      });

      const results = await Promise.all(bookingPromises);
      console.log("All bookings created successfully:", results);

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

  // Nếu đặt không được
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
                  const isBooked = bookedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      className={`seat ${
                        isBooked ? "taken" : isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleSeatSelect(seatId)}
                      disabled={isBooked}
                      title={
                        isBooked
                          ? `Seat ${seatId} - Already Taken`
                          : isSelected
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
              <span>Your Selection (Yellow)</span>
            </div>
            <div className="legend-item">
              <div className="seat selected"></div>
              <span>Already Taken (Red)</span>
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
