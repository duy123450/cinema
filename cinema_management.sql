USE cinema_management;

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    avatar varchar(255) DEFAULT 'default-avatar.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- MOVIES TABLE
-- ========================================
CREATE TABLE movies (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    original_title VARCHAR(200),
    description TEXT,
    duration_minutes INT NOT NULL,
    release_date DATE,
    director VARCHAR(100),
    cast_names TEXT,
    genre VARCHAR(100),
    language VARCHAR(50) DEFAULT 'English',
    rating ENUM('G', 'PG', 'PG-13', 'R', 'NC-17') DEFAULT 'PG-13',
    imdb_rating DECIMAL(3,1),
    poster_url VARCHAR(500),
    trailer_url VARCHAR(500),
    status ENUM('upcoming', 'now_showing', 'ended') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- CINEMAS TABLE
-- ========================================
CREATE TABLE cinemas (
    cinema_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    total_screens INT NOT NULL,
    total_seats INT NOT NULL,
    amenities TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status ENUM('open', 'closed', 'under_construction') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- SCREENS TABLE
-- ========================================
CREATE TABLE screens (
    screen_id INT PRIMARY KEY AUTO_INCREMENT,
    cinema_id INT NOT NULL,
    screen_number VARCHAR(10) NOT NULL,
    total_seats INT NOT NULL,
    seat_layout JSON,
    screen_type ENUM('standard', 'imax', 'dolby_atmos', '3d', '4dx') DEFAULT 'standard',
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id) ON DELETE CASCADE
);

-- ========================================
-- SHOWTIMES TABLE
-- ========================================
CREATE TABLE showtimes (
    showtime_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    screen_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    price DECIMAL(6,2) NOT NULL,
    available_seats JSON,
    status ENUM('scheduled', 'active', 'cancelled', 'completed') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (screen_id) REFERENCES screens(screen_id) ON DELETE CASCADE,
    UNIQUE KEY unique_showtime (screen_id, show_date, show_time)
);

-- ========================================
-- TICKETS TABLE
-- ========================================
CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    showtime_id INT NOT NULL,
    user_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    ticket_type ENUM('adult', 'child', 'senior', 'student') DEFAULT 'adult',
    price_paid DECIMAL(6,2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('booked', 'paid', 'cancelled', 'used') DEFAULT 'booked',
    qr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat_booking (showtime_id, seat_number)
);

-- ========================================
-- PAYMENTS TABLE
-- ========================================
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'cash', 'mobile') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ========================================
-- REVIEWS TABLE
-- ========================================
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_movie_review (movie_id, user_id)
);

-- ========================================
-- PROMOTIONS TABLE
-- ========================================
CREATE TABLE promotions (
    promotion_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount', 'buy_x_get_y') NOT NULL,
    discount_value DECIMAL(5,2) NOT NULL,
    min_amount DECIMAL(6,2),
    max_discount DECIMAL(6,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    code VARCHAR(20) UNIQUE,
    usage_limit INT,
    used_count INT DEFAULT 0,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- BOOKMARKS TABLE (Users can bookmark movies)
-- ========================================
CREATE TABLE bookmarks (
    bookmark_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_movie_bookmark (user_id, movie_id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Movies table indexes
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_movies_release_date ON movies(release_date);

-- Cinemas table indexes
CREATE INDEX idx_cinemas_city ON cinemas(city);
CREATE INDEX idx_cinemas_status ON cinemas(status);

-- Showtimes table indexes
CREATE INDEX idx_showtimes_date ON showtimes(show_date);
CREATE INDEX idx_showtimes_movie ON showtimes(movie_id);
CREATE INDEX idx_showtimes_screen ON showtimes(screen_id);

-- Tickets table indexes
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_showtime ON tickets(showtime_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Reviews table indexes
CREATE INDEX idx_reviews_movie ON reviews(movie_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Payments table indexes
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, role, status) VALUES
('admin', 'admin@cinema.com', '$2a$10$DSQC8DjGzvjqFms2db2js.9SM9LaEf1CCfI7OGWswIMpRaILIa6c.', 'Admin', 'User', 'admin', 'active'),
('john_doe', 'john@example.com', '$2a$10$L.MQc1NMoQym8LEYZrTGG.GFBIV0mgtFiROr7lx7eVaj0WB7wqwbO', 'John', 'Doe', 'customer', 'active'),
('jane_smith', 'jane@example.com', '$2a$10$L.MQc1NMoQym8LEYZrTGG.GFBIV0mgtFiROr7lx7eVaj0WB7wqwbO', 'Jane', 'Smith', 'customer', 'active');

-- Insert sample cinemas
INSERT INTO cinemas (name, address, city, country, total_screens, total_seats) VALUES
('Downtown Cinema', '123 Main St', 'New York', 'USA', 5, 800),
('Plaza Theater', '456 Oak Ave', 'Los Angeles', 'USA', 8, 1200),
('City Center Cinema', '789 Broadway', 'Chicago', 'USA', 6, 1000);

-- Insert sample screens
INSERT INTO screens (cinema_id, screen_number, total_seats, screen_type) VALUES
(1, 'Screen 1', 150, 'imax'),
(1, 'Screen 2', 120, 'standard'),
(2, 'Screen 1', 200, 'dolby_atmos'),
(2, 'Screen 2', 180, '3d');

-- Insert sample movies
INSERT INTO movies (title, description, duration_minutes, release_date, director, genre, rating, status) VALUES
('Tensura Movie 2', 'The slime returns stronger than ever!', 120, '2025-11-25', 'Makoto Kuroboshi', 'Animation, Fantasy, Adventure', 'PG-13', 'now_showing'),
('Spider-Man: Across the Spider-Verse', 'Miles Morales returns in this animated sequel', 140, '2023-06-02', 'Joaquim Dos Santos', 'Animation, Action, Adventure', 'PG', 'now_showing'),
('Dune: Part Two', 'Paul Atreides leads the fight for the desert planet', 166, '2024-03-01', 'Denis Villeneuve', 'Sci-Fi, Action, Drama', 'PG-13', 'now_showing');

-- Insert sample showtimes
INSERT INTO showtimes (movie_id, screen_id, show_date, show_time, price, available_seats) VALUES
(1, 1, '2025-11-25', '18:00:00', 12.99, JSON_ARRAY('A1', 'A2', 'A3', 'A4', 'A5')),
(1, 1, '2025-11-25', '21:00:00', 12.99, JSON_ARRAY('A1', 'A2', 'A3', 'A4', 'A5')),
(2, 2, '2025-11-25', '19:30:00', 10.99, JSON_ARRAY('B1', 'B2', 'B3', 'B4', 'B5'));

-- Insert sample tickets
INSERT INTO tickets (showtime_id, user_id, seat_number, ticket_type, price_paid, status) VALUES
(1, 2, 'A1', 'adult', 12.99, 'paid'),
(1, 2, 'A2', 'adult', 12.99, 'paid'),
(1, 3, 'A3', 'student', 9.99, 'paid');

-- Insert sample payments
INSERT INTO payments (ticket_id, user_id, amount, payment_method, payment_status) VALUES
(1, 2, 12.99, 'credit_card', 'completed'),
(2, 2, 12.99, 'paypal', 'completed'),
(3, 3, 9.99, 'credit_card', 'completed');

-- Insert sample reviews
INSERT INTO reviews (movie_id, user_id, rating, comment, is_verified_purchase) VALUES
(1, 2, 5, 'Amazing sequel! Rimuru is so cool!', TRUE),
(2, 3, 4, 'Great animation and story. Highly recommended!', TRUE);

-- Insert sample promotions
INSERT INTO promotions (title, description, discount_type, discount_value, start_date, end_date, code, status) VALUES
('Black Friday Sale', '25% off all tickets', 'percentage', 25.00, '2025-11-28', '2025-11-30', 'BF25', 'active'),
('Student Discount', 'Students get 20% off', 'percentage', 20.00, '2025-01-01', '2025-12-31', 'STUDENT20', 'active');

-- Insert sample bookmarks
INSERT INTO bookmarks (user_id, movie_id) VALUES
(2, 1),
(3, 2),
(2, 3);