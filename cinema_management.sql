-- FULL UPDATED CINEMA MANAGEMENT SQL SCRIPT
USE cinema_management;
-- ========================================
-- USERS TABLE (add reset_token & reset_token_expiry)
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
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ========================================
-- MOVIES, CINEMAS, SCREENS, SHOWTIMES, TICKETS,
-- PAYMENTS, REVIEWS, PROMOTIONS, BOOKMARKS
-- (same as before but expanded sample data)
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
    imdb_rating DECIMAL(3, 1),
    poster_url VARCHAR(500),
    trailer_url VARCHAR(500),
    status ENUM('upcoming', 'now_showing', 'ended') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
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
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('open', 'closed', 'under_construction') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE screens (
    screen_id INT PRIMARY KEY AUTO_INCREMENT,
    cinema_id INT NOT NULL,
    screen_number VARCHAR(10) NOT NULL,
    total_seats INT NOT NULL,
    screen_type ENUM('standard', 'imax', 'dolby_atmos', '3d', '4dx') DEFAULT 'standard',
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id) ON DELETE CASCADE
);
CREATE TABLE showtimes (
    showtime_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    screen_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (screen_id) REFERENCES screens(screen_id) ON DELETE CASCADE
);
CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    showtime_id INT NOT NULL,
    user_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    ticket_type ENUM('adult', 'student', 'child') DEFAULT 'adult',
    price_paid DECIMAL(10, 2) NOT NULL,
    status ENUM('booked', 'paid', 'cancelled') DEFAULT 'booked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM(
        'credit_card',
        'debit_card',
        'paypal',
        'cash',
        'mobile'
    ) DEFAULT 'credit_card',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (
        rating BETWEEN 1 AND 5
    ),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE promotions (
    promotion_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    code VARCHAR(50) UNIQUE,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE bookmarks (
    bookmark_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, movie_id)
);
-- ========================================
-- SEATS TABLE (7 columns x 9 rows per screen)
-- ========================================
CREATE TABLE seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT,
    screen_id INT NOT NULL,
    seat_row CHAR(1) NOT NULL,
    seat_number INT NOT NULL,
    seat_label VARCHAR(10) NOT NULL,
    status ENUM('available', 'broken') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (screen_id) REFERENCES screens(screen_id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (screen_id, seat_label)
);
-- ========================================
-- INSERT DATA
-- ========================================
-- USERS (add 2 staff + 2 more customers)
INSERT INTO users (
        username,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        status
    )
VALUES (
        'Duy',
        'duy.h0098642@gmail.com',
        '$2y$10$GmOOxLkfr68r8dc1cE19luifeG5vN1XydRuaDZBccVLG4sbJYPdp6',
        'Duy',
        'Pham Thai',
        'admin',
        'active'
    ),
    (
        'staff_mike',
        'mike@cinema.com',
        'pass',
        'Mike',
        'Johnson',
        'staff',
        'active'
    ),
    (
        'staff_emma',
        'emma@cinema.com',
        'pass',
        'Emma',
        'Turner',
        'staff',
        'active'
    ),
    (
        'john_doe',
        'john@example.com',
        'pass',
        'John',
        'Doe',
        'customer',
        'active'
    ),
    (
        'jane_smith',
        'jane@example.com',
        'pass',
        'Jane',
        'Smith',
        'customer',
        'active'
    ),
    (
        'customer_bob',
        'bob@example.com',
        'pass',
        'Bob',
        'Marley',
        'customer',
        'active'
    ),
    (
        'customer_alice',
        'alice@example.com',
        'pass',
        'Alice',
        'Wong',
        'customer',
        'active'
    );
-- CINEMAS
INSERT INTO cinemas (
        name,
        address,
        city,
        country,
        total_screens,
        total_seats
    )
VALUES (
        'Downtown Cinema',
        '123 Main St',
        'New York',
        'USA',
        5,
        800
    ),
    (
        'Plaza Theater',
        '456 Oak Ave',
        'Los Angeles',
        'USA',
        5,
        800
    ),
    (
        'City Center Cinema',
        '789 Broadway',
        'Chicago',
        'USA',
        5,
        800
    );
-- SCREENS (Option A: 5 screens per cinema, each with different type)
INSERT INTO screens (
        cinema_id,
        screen_number,
        total_seats,
        screen_type
    )
VALUES -- Cinema 1
    (1, 'Screen 1', 63, 'standard'),
    (1, 'Screen 2', 63, 'imax'),
    (1, 'Screen 3', 63, 'dolby_atmos'),
    (1, 'Screen 4', 63, '3d'),
    (1, 'Screen 5', 63, '4dx'),
    -- Cinema 2
    (2, 'Screen 1', 63, 'standard'),
    (2, 'Screen 2', 63, 'imax'),
    (2, 'Screen 3', 63, 'dolby_atmos'),
    (2, 'Screen 4', 63, '3d'),
    (2, 'Screen 5', 63, '4dx'),
    -- Cinema 3
    (3, 'Screen 1', 63, 'standard'),
    (3, 'Screen 2', 63, 'imax'),
    (3, 'Screen 3', 63, 'dolby_atmos'),
    (3, 'Screen 4', 63, '3d'),
    (3, 'Screen 5', 63, '4dx');
-- SEATS (7 columns x 9 rows per screen)
-- seat rows A–I, numbers 1–7
INSERT INTO seats (screen_id, seat_row, seat_number, seat_label)
SELECT s.screen_id,
    r.row_label,
    n.num,
    CONCAT(r.row_label, n.num)
FROM screens s
    CROSS JOIN (
        SELECT 'A' row_label
        UNION
        SELECT 'B'
        UNION
        SELECT 'C'
        UNION
        SELECT 'D'
        UNION
        SELECT 'E'
        UNION
        SELECT 'F'
        UNION
        SELECT 'G'
        UNION
        SELECT 'H'
        UNION
        SELECT 'I'
    ) r
    CROSS JOIN (
        SELECT 1 num
        UNION
        SELECT 2
        UNION
        SELECT 3
        UNION
        SELECT 4
        UNION
        SELECT 5
        UNION
        SELECT 6
        UNION
        SELECT 7
    ) n;
-- MOVIES (add 12 more)
INSERT INTO movies (
        title,
        description,
        duration_minutes,
        release_date,
        director,
        genre,
        rating,
        status
    )
VALUES (
        'Tensura Movie 2',
        'Slime returns',
        120,
        '2025-11-25',
        'Makoto',
        'Animation',
        'PG-13',
        'now_showing'
    ),
    (
        'Spider-Verse',
        'Multiverse adventure',
        140,
        '2024-01-10',
        'Santos',
        'Animation',
        'PG',
        'now_showing'
    ),
    (
        'Dune 2',
        'Desert wars',
        166,
        '2024-03-01',
        'Villeneuve',
        'Sci-Fi',
        'PG-13',
        'now_showing'
    ),
    (
        'Avengers Reborn',
        'Earths mightiest return',
        150,
        '2026-05-01',
        'Russo',
        'Action',
        'PG-13',
        'upcoming'
    ),
    (
        ' Frozen 3 ',
        ' Elsa returns ',
        120,
        ' 2026 -11 -20 ',
        ' Buck ',
        ' Animation ',
        ' PG ',
        ' upcoming '
    ),
    (
        ' Batman Legacy ',
        ' Dark Knight rises again ',
        155,
        ' 2025 -10 -01 ',
        ' Reeves ',
        ' Action ',
        ' PG -13 ',
        ' upcoming '
    ),
    (
        ' One Piece Red 2 ',
        ' Shanks returns ',
        125,
        ' 2026 -01 -15 ',
        ' Oda ',
        ' Animation ',
        ' PG ',
        ' upcoming '
    ),
    (
        ' Harry Potter Reboot ',
        ' New cast ',
        180,
        ' 2027 -07 -10 ',
        ' Columbus ',
        ' Fantasy ',
        ' PG -13 ',
        ' upcoming '
    ),
    (
        ' Sonic 4 ',
        ' Blue hedgehog again ',
        115,
        ' 2025 -12 -01 ',
        ' Fowler ',
        ' Action ',
        ' PG ',
        ' now_showing '
    ),
    (
        ' Godzilla x Kong 3 ',
        ' Titans clash ',
        160,
        ' 2026 -03 -01 ',
        ' Wingard ',
        ' Action ',
        ' PG -13 ',
        ' upcoming '
    ),
    (
        ' Mario Movie 2 ',
        ' Mario adventure ',
        110,
        ' 2026 -06 -15 ',
        ' Horvath ',
        ' Animation ',
        ' PG ',
        ' upcoming '
    ),
    (
        ' Avatar 4 ',
        ' Pandora again ',
        180,
        ' 2027 -12 -20 ',
        ' Cameron ',
        ' Sci - Fi ',
        ' PG -13 ',
        ' upcoming '
    ),
    (
        ' John Wick 5 ',
        ' Baba Yaga returns ',
        145,
        ' 2026 -09 -01 ',
        ' Stahelski ',
        ' Action ',
        ' R ',
        ' upcoming '
    );
-- TICKETS (7 more)
INSERT INTO tickets (
        showtime_id,
        user_id,
        seat_number,
        ticket_type,
        price_paid,
        status
    )
VALUES 
    (1, 2, ' A1 ', ' adult ', 12.99, 'paid'),
    (1, 2, ' A2 ', ' adult ', 12.99, 'paid'),
    (1, 3, ' A3 ', ' student ', 9.99, 'paid'),
    (1, 4, ' A4 ', ' adult ', 12.99, 'paid'),
    (2, 5, ' A1 ', ' adult ', 12.99, 'paid'),
    (2, 6, ' A2 ', ' adult ', 12.99, 'paid'),
    (3, 7, ' B3 ', ' adult ', 10.99, 'paid'),
    (3, 2, ' B4 ', ' adult ', 10.99, 'paid'),
    (3, 3, ' B5 ', ' adult ', 10.99, 'paid');
-- PAYMENTS (7 more)
INSERT INTO payments (
        ticket_id,
        user_id,
        amount,
        payment_method,
        payment_status
    )
VALUES (1, 2, 12.99, ' credit_card ', ' completed '),
    (2, 2, 12.99, ' paypal ', ' completed '),
    (3, 3, 9.99, ' credit_card ', ' completed '),
    (4, 4, 12.99, ' credit_card ', ' completed '),
    (5, 5, 12.99, ' cash ', ' completed '),
    (6, 6, 12.99, ' debit_card ', ' completed '),
    (7, 7, 10.99, ' mobile ', ' completed ');
-- REVIEWS (8 more)
INSERT INTO reviews (
        movie_id,
        user_id,
        rating,
        comment,
        is_verified_purchase
    )
VALUES (1, 2, 5, ' Amazing ! ', TRUE),
    (2, 3, 4, ' Great ! ', TRUE),
    (3, 4, 5, ' Epic movie ', TRUE),
    (4, 5, 4, ' Good effects ', FALSE),
    (5, 6, 5, ' Family fun ', TRUE),
    (6, 7, 4, ' Great action ', TRUE),
    (7, 2, 5, ' Masterpiece ', FALSE),
    (8, 3, 4, ' Nice reboot ', FALSE);
-- PROMOTIONS (3 more)
INSERT INTO promotions (
        title,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
        code,
        status
    )
VALUES (
        ' Black Friday ',
        ' 25 % off ',
        ' percentage ',
        25,
        ' 2025 -11 -28 ',
        ' 2025 -11 -30 ',
        ' BF25 ',
        ' active '
    ),
    (
        ' Student Discount ',
        ' 20 % off ',
        ' percentage ',
        20,
        ' 2025 -01 -01 ',
        ' 2025 -12 -31 ',
        ' STUDENT20 ',
        ' active '
    ),
    (
        ' Holiday Sale ',
        ' 15 % off ',
        ' percentage ',
        15,
        ' 2025 -12 -20 ',
        ' 2025 -12 -31 ',
        ' HOLIDAY15 ',
        ' active '
    ),
    (
        ' Early Bird ',
        ' $3 off ',
        ' fixed_amount ',
        3,
        ' 2025 -01 -01 ',
        ' 2025 -06 -01 ',
        ' EARLY3 ',
        ' active '
    );
-- BOOKMARKS (random many)
INSERT INTO bookmarks (user_id, movie_id)
VALUES (2, 1),
(2, 2),
(2, 3),
(3, 1),
(3, 5),
(4, 2),
(5, 3),
(6, 7),
(7, 4),
(7, 5);