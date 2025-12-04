-- ========================================
-- CINEMA MANAGEMENT DATABASE SCHEMA
-- ========================================
DROP DATABASE IF EXISTS cinema_management;
CREATE DATABASE cinema_management;
USE cinema_management;
-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
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
-- MOVIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS movies (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    original_title VARCHAR(200),
    description TEXT,
    duration_minutes INT NOT NULL,
    release_date DATE,
    director VARCHAR(100),
    genre VARCHAR(100),
    language VARCHAR(50) DEFAULT 'English',
    rating ENUM('G', 'PG', 'PG-13', 'R', 'NC-17') DEFAULT 'PG-13',
    imdb_rating DECIMAL(3, 1),
    poster_url VARCHAR(500),
    status ENUM('upcoming', 'now_showing', 'ended') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ========================================
-- CINEMAS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS cinemas (
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
-- ========================================
-- SCREENS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS screens (
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
-- ========================================
-- SHOWTIMES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS showtimes (
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
-- ========================================
-- TICKETS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS tickets (
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
-- ========================================
-- PAYMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
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
-- ========================================
-- REVIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS reviews (
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
-- ========================================
-- PROMOTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS promotions (
    promotion_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    code VARCHAR(50) UNIQUE,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    promotion_type ENUM('general', 'birthday', 'seasonal', 'loyalty') DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ========================================
-- BOOKMARKS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS bookmarks (
    bookmark_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, movie_id)
);
-- ========================================
-- SEATS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS seats (
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
-- ACTORS TABLE (NEW)
-- ========================================
CREATE TABLE IF NOT EXISTS actors (
    actor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    bio TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ========================================
-- MOVIE_CAST TABLE (NEW - Junction Table)
-- ========================================
CREATE TABLE IF NOT EXISTS movie_cast (
    cast_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    actor_id INT NOT NULL,
    character_name VARCHAR(100) NOT NULL,
    role_type ENUM('lead', 'supporting', 'cameo') DEFAULT 'supporting',
    cast_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors(actor_id) ON DELETE CASCADE,
    UNIQUE KEY unique_cast (movie_id, actor_id, character_name)
);
-- ========================================
-- MOVIE_TRAILERS TABLE (NEW)
-- ========================================
CREATE TABLE IF NOT EXISTS movie_trailers (
    trailer_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    title VARCHAR(200),
    url VARCHAR(500) NOT NULL,
    duration_seconds INT,
    trailer_type ENUM(
        'official',
        'teaser',
        'clip',
        'behind_the_scenes'
    ) DEFAULT 'official',
    language VARCHAR(50) DEFAULT 'English',
    is_featured BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE
);
-- ========================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_movies_release_date ON movies(release_date);
CREATE INDEX idx_screens_cinema ON screens(cinema_id);
CREATE INDEX idx_showtimes_movie ON showtimes(movie_id);
CREATE INDEX idx_showtimes_screen ON showtimes(screen_id);
CREATE INDEX idx_showtimes_date ON showtimes(show_date);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_showtime ON tickets(showtime_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_reviews_movie ON reviews(movie_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_movie ON bookmarks(movie_id);
CREATE INDEX idx_movie_cast_movie ON movie_cast(movie_id);
CREATE INDEX idx_movie_cast_actor ON movie_cast(actor_id);
CREATE INDEX idx_trailers_movie ON movie_trailers(movie_id);
-- ========================================
-- USERS DATA
-- ========================================
INSERT INTO users (
        username,
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        date_of_birth,
        role,
        status,
        avatar
    )
VALUES (
        'Duy',
        'duy.h0098642@gmail.com',
        '$2y$10$GmOOxLkfr68r8dc1cE19luifeG5vN1XydRuaDZBccVLG4sbJYPdp6',
        'Duy',
        'Pham Thai',
        '+84-123-456-789',
        '1995-12-03',
        'admin',
        'active',
        'default-avatar.png'
    ),
    (
        'staff_mike',
        'mike@cinema.com',
        '$2y$10$GmOOxLkfr68r8dc1cE19luifeG5vN1XydRuaDZBccVLG4sbJYPdp6',
        'Mike',
        'Johnson',
        '+1-212-555-0101',
        '1990-05-15',
        'staff',
        'active',
        'default-avatar.png'
    ),
    (
        'staff_emma',
        'emma@cinema.com',
        '$2y$10$GmOOxLkfr68r8dc1cE19luifeG5vN1XydRuaDZBccVLG4sbJYPdp6',
        'Emma',
        'Turner',
        '+1-212-555-0102',
        '1992-07-22',
        'staff',
        'active',
        'default-avatar.png'
    ),
    (
        'john_doe',
        'john@example.com',
        '$2y$10$GmOOxLkfr68r8dc1cE19luifeG5vN1XydRuaDZBccVLG4sbJYPdp6',
        'John',
        'Doe',
        '+1-212-555-0103',
        '1998-03-10',
        'customer',
        'active',
        'default-avatar.png'
    ),
    (
        'jane_smith',
        'jane@example.com',
        '$2y$10$GmOOxLkfr68r8dc1cE19luifeG5vN1XydRuaDZBccVLG4sbJYPdp6',
        'Jane',
        'Smith',
        '+1-212-555-0104',
        '2000-01-25',
        'customer',
        'active',
        'default-avatar.png'
    ),
    (
        'customer_bob',
        'bob@example.com',
        '$2y$10$GmOOxLkfr68r8dc1cE19luifeG5vN1XydRuaDZBccVLG4sbJYPdp6',
        'Bob',
        'Marley',
        '+1-212-555-0105',
        '1988-12-03',
        'customer',
        'active',
        'default-avatar.png'
    ),
    (
        'customer_alice',
        'alice@example.com',
        '$2y$10$GmOOxLkfr68r8dc1cE19luifeG5vN1XydRuaDZBccVLG4sbJYPdp6',
        'Alice',
        'Wong',
        '+1-212-555-0106',
        '1999-09-18',
        'customer',
        'active',
        'default-avatar.png'
    );
-- ========================================
-- CINEMAS DATA
-- ========================================
INSERT INTO cinemas (
        name,
        address,
        city,
        state,
        country,
        postal_code,
        phone,
        email,
        total_screens,
        total_seats,
        amenities,
        latitude,
        longitude,
        status
    )
VALUES (
        'Downtown Cinema',
        '123 Main Street',
        'New York',
        'NY',
        'USA',
        '10001',
        '+1-212-555-0001',
        'downtown@cinema.com',
        5,
        800,
        'IMAX, 3D, Dolby Atmos, Wheelchair Access, Parking',
        40.7128,
        -74.0060,
        'open'
    ),
    (
        'Plaza Theater',
        '456 Oak Avenue',
        'Los Angeles',
        'CA',
        'USA',
        '90001',
        '+1-213-555-0002',
        'plaza@cinema.com',
        5,
        800,
        '4DX, Premium Recliners, VIP Lounge, Concessions',
        34.0522,
        -118.2437,
        'open'
    ),
    (
        'City Center Cinema',
        '789 Broadway',
        'Chicago',
        'IL',
        'USA',
        '60601',
        '+1-312-555-0003',
        'citycenter@cinema.com',
        5,
        800,
        'Standard, 3D, Dolby Cinema, Reserved Seating',
        41.8781,
        -87.6298,
        'open'
    );
-- ========================================
-- SCREENS DATA
-- ========================================
INSERT INTO screens (
        cinema_id,
        screen_number,
        total_seats,
        screen_type,
        status
    )
VALUES -- Downtown Cinema (cinema_id = 1)
    (1, 'Screen 1', 200, 'standard', 'active'),
    (1, 'Screen 2', 180, 'imax', 'active'),
    (1, 'Screen 3', 180, 'dolby_atmos', 'active'),
    (1, 'Screen 4', 160, '3d', 'active'),
    (1, 'Screen 5', 100, '4dx', 'active'),
    -- Plaza Theater (cinema_id = 2)
    (2, 'Screen 1', 200, 'standard', 'active'),
    (2, 'Screen 2', 180, 'imax', 'active'),
    (2, 'Screen 3', 180, 'dolby_atmos', 'active'),
    (2, 'Screen 4', 160, '3d', 'maintenance'),
    (2, 'Screen 5', 100, '4dx', 'active'),
    -- City Center Cinema (cinema_id = 3)
    (3, 'Screen 1', 200, 'standard', 'active'),
    (3, 'Screen 2', 180, 'imax', 'active'),
    (3, 'Screen 3', 180, 'dolby_atmos', 'active'),
    (3, 'Screen 4', 160, '3d', 'active'),
    (3, 'Screen 5', 100, '4dx', 'active');
-- ========================================
-- ACTORS DATA
-- ========================================
INSERT INTO actors (name, bio, image_url)
VALUES (
        'Rimuru Tempest',
        'The protagonist reborn as a powerful Slime monster with incredible abilities',
        'https://cdn.example.com/actors/rimuru.jpg'
    ),
    (
        'Benimaru',
        'A skilled demon warrior and loyal companion to Rimuru',
        'https://cdn.example.com/actors/benimaru.jpg'
    ),
    (
        'Shion',
        'An intelligent demon maid devoted to Rimuru',
        'https://cdn.example.com/actors/shion.jpg'
    ),
    (
        'Hiiro',
        'A powerful harpy with mastery of lightning magic',
        'https://cdn.example.com/actors/hiiro.jpg'
    ),
    (
        'Veldora',
        'An ancient dragon with immense magical power',
        'https://cdn.example.com/actors/veldora.jpg'
    ),
    (
        'Timothée Chalamet',
        'Lead actor known for intense dramatic roles',
        'https://cdn.example.com/actors/timothee.jpg'
    ),
    (
        'Zendaya',
        'Talented actress and producer with global appeal',
        'https://cdn.example.com/actors/zendaya.jpg'
    ),
    (
        'Rebecca Ferguson',
        'Award-winning actress known for diverse roles',
        'https://cdn.example.com/actors/rebecca.jpg'
    ),
    (
        'Austin Butler',
        'Rising star actor with incredible range',
        'https://cdn.example.com/actors/austin.jpg'
    ),
    (
        'Miles Morales',
        'Spider-Man from the animated multiverse',
        'https://cdn.example.com/actors/miles.jpg'
    ),
    (
        'Gwen Stacy',
        'Spider-Gwen from an alternate universe',
        'https://cdn.example.com/actors/gwen.jpg'
    );
-- ========================================
-- MOVIES DATA
-- ========================================
INSERT INTO movies (
        title,
        original_title,
        description,
        duration_minutes,
        release_date,
        director,
        genre,
        language,
        rating,
        imdb_rating,
        poster_url,
        status
    )
VALUES (
        'Tensura Movie 2',
        'That Time I Got Reincarnated as a Slime Movie 2',
        'Rimuru and his allies face new challenges as powerful forces emerge from the depths. A stunning anime continuation with breathtaking action sequences.',
        120,
        '2025-11-25',
        'Makoto Uchida',
        'Animation/Fantasy',
        'Japanese',
        'PG-13',
        8.5,
        'https://cdn.example.com/posters/tensura2.jpg',
        'now_showing'
    ),
    (
        'Spider-Verse: Across the Multiverse',
        'Spider-Man: Across the Spider-Verse',
        'Miles Morales ventures across the Spider-Verse in an epic adventure that breaks animation boundaries.',
        140,
        '2024-01-10',
        'Justin K. Thompson',
        'Animation/Action',
        'English',
        'PG',
        8.9,
        'https://cdn.example.com/posters/spiderverse.jpg',
        'now_showing'
    ),
    (
        'Dune: Part Two',
        'Dune: Part Two',
        'Paul Atreides travels to the dangerous planet Arrakis to fulfill a dangerous prophecy. Epic sci-fi drama based on Frank Herberts masterpiece.',
        166,
        '2024-03-01',
        'Denis Villeneuve',
        'Sci-Fi/Drama',
        'English',
        'PG-13',
        8.7,
        'https://cdn.example.com/posters/dune2.jpg',
        'now_showing'
    ),
    (
        'Avengers: Reborn',
        'Avengers: Endgame - Extended',
        'The Earths mightiest heroes reunite for one final stand against cosmic forces.',
        150,
        '2026-05-01',
        'Russo Brothers',
        'Action/Adventure',
        'English',
        'PG-13',
        9.0,
        'https://cdn.example.com/posters/avengers_reborn.jpg',
        'upcoming'
    ),
    (
        'Frozen III',
        'Frozen III',
        'Elsa and Anna embark on a new adventure beyond the enchanted forest.',
        120,
        '2026-11-20',
        'Chris Buck',
        'Animation/Fantasy',
        'English',
        'PG',
        8.3,
        'https://cdn.example.com/posters/frozen3.jpg',
        'upcoming'
    ),
    (
        'The Batman: Legacy',
        'The Batman: Legacy',
        'The Dark Knight rises again to face a new threat to Gotham City.',
        155,
        '2025-10-01',
        'Matt Reeves',
        'Action/Crime',
        'English',
        'PG-13',
        8.8,
        'https://cdn.example.com/posters/batman_legacy.jpg',
        'upcoming'
    ),
    (
        'One Piece: Red Resurrection',
        'One Piece Red Resurrection',
        'Shanks returns with unprecedented power. An epic pirate adventure awaits.',
        125,
        '2026-01-15',
        'Eiichiro Oda',
        'Animation/Adventure',
        'Japanese',
        'PG',
        8.6,
        'https://cdn.example.com/posters/onepiece_red2.jpg',
        'upcoming'
    ),
    (
        'Harry Potter: The New Generation',
        'Harry Potter and the New Generation',
        'A new cast takes over as the wizarding world faces unprecedented threats.',
        180,
        '2027-07-10',
        'Chris Columbus',
        'Fantasy/Adventure',
        'English',
        'PG-13',
        8.2,
        'https://cdn.example.com/posters/harrypotter_new.jpg',
        'upcoming'
    ),
    (
        'Sonic 4',
        'Sonic the Hedgehog 4',
        'The blue speedster returns for his most ambitious adventure yet.',
        115,
        '2025-12-01',
        'Jeff Fowler',
        'Action/Adventure',
        'English',
        'PG',
        7.9,
        'https://cdn.example.com/posters/sonic4.jpg',
        'now_showing'
    ),
    (
        'Godzilla x Kong: Titans Clash',
        'Godzilla x Kong 3: Titans Clash',
        'Two titans battle across a devastated world in an apocalyptic showdown.',
        160,
        '2026-03-01',
        'Adam Wingard',
        'Action/Sci-Fi',
        'English',
        'PG-13',
        8.4,
        'https://cdn.example.com/posters/godzilla_kong3.jpg',
        'upcoming'
    ),
    (
        'The Super Mario Bros. Movie 2',
        'The Super Mario Bros. Movie 2',
        'Mario and friends face off against new enemies in the Mushroom Kingdom.',
        110,
        '2026-06-15',
        'Aaron Horvath',
        'Animation/Comedy',
        'English',
        'PG',
        8.1,
        'https://cdn.example.com/posters/mario2.jpg',
        'upcoming'
    ),
    (
        'Avatar: Reclamation',
        'Avatar 4: Reclamation',
        'Return to Pandora for an epic continuation of the Avatar saga.',
        180,
        '2027-12-20',
        'James Cameron',
        'Sci-Fi/Adventure',
        'English',
        'PG-13',
        8.8,
        'https://cdn.example.com/posters/avatar4.jpg',
        'upcoming'
    ),
    (
        'John Wick: Retribution',
        'John Wick 5: Retribution',
        'The legendary assassin returns for his final mission.',
        145,
        '2026-09-01',
        'Chad Stahelski',
        'Action/Thriller',
        'English',
        'R',
        8.5,
        'https://cdn.example.com/posters/johnwick5.jpg',
        'upcoming'
    );
-- ========================================
-- MOVIE_CAST DATA
-- ========================================
INSERT INTO movie_cast (
        movie_id,
        actor_id,
        character_name,
        role_type,
        cast_order
    )
VALUES -- Tensura Movie 2 (movie_id = 1)
    (1, 1, 'Rimuru Tempest', 'lead', 1),
    (1, 2, 'Benimaru', 'supporting', 2),
    (1, 3, 'Shion', 'supporting', 3),
    (1, 4, 'Hiiro', 'supporting', 4),
    (1, 5, 'Veldora', 'cameo', 5),
    -- Spider-Verse (movie_id = 2)
    (2, 10, 'Miles Morales / Spider-Man', 'lead', 1),
    (
        2,
        11,
        'Gwen Stacy / Spider-Gwen',
        'supporting',
        2
    ),
    -- Dune: Part Two (movie_id = 3)
    (3, 6, 'Paul Atreides', 'lead', 1),
    (3, 7, 'Chani', 'supporting', 2),
    (3, 8, 'Lady Jessica', 'supporting', 3),
    (3, 9, 'Feyd-Rautha', 'supporting', 4),
    -- Additional movies use same actors for simplicity
    (4, 6, 'Tony Stark', 'cameo', 1),
    (5, 7, 'Elsa', 'lead', 1),
    (6, 9, 'Batman / Bruce Wayne', 'lead', 1),
    (9, 10, 'Sonic the Hedgehog', 'lead', 1);
-- ========================================
-- MOVIE_TRAILERS DATA
-- ========================================
INSERT INTO movie_trailers (
        movie_id,
        title,
        url,
        duration_seconds,
        trailer_type,
        language,
        is_featured,
        views
    )
VALUES -- Tensura Movie 2 trailers
    (
        1,
        'Tensura Movie 2 - Official Trailer',
        'https://youtube.com/watch?v=tensura2_official',
        180,
        'official',
        'Japanese',
        TRUE,
        2500000
    ),
    (
        1,
        'Tensura Movie 2 - Teaser Trailer',
        'https://youtube.com/watch?v=tensura2_teaser',
        90,
        'teaser',
        'Japanese',
        FALSE,
        850000
    ),
    (
        1,
        'Tensura Movie 2 - Behind the Scenes',
        'https://youtube.com/watch?v=tensura2_bts',
        240,
        'behind_the_scenes',
        'Japanese',
        FALSE,
        420000
    ),
    -- Spider-Verse trailers
    (
        2,
        'Spider-Verse - Official Trailer',
        'https://youtube.com/watch?v=spiderverse_official',
        240,
        'official',
        'English',
        TRUE,
        3200000
    ),
    (
        2,
        'Spider-Verse - Teaser',
        'https://youtube.com/watch?v=spiderverse_teaser',
        120,
        'teaser',
        'English',
        FALSE,
        1100000
    ),
    -- Dune: Part Two trailers
    (
        3,
        'Dune Part 2 - Official Trailer',
        'https://youtube.com/watch?v=dune2_official',
        180,
        'official',
        'English',
        TRUE,
        5600000
    ),
    (
        3,
        'Dune Part 2 - Special Clip',
        'https://youtube.com/watch?v=dune2_clip',
        120,
        'clip',
        'English',
        FALSE,
        920000
    ),
    (
        3,
        'Dune Part 2 - Behind the Scenes',
        'https://youtube.com/watch?v=dune2_bts',
        300,
        'behind_the_scenes',
        'English',
        FALSE,
        780000
    ),
    -- Sonic 4 trailers
    (
        9,
        'Sonic 4 - Official Trailer',
        'https://youtube.com/watch?v=sonic4_official',
        150,
        'official',
        'English',
        TRUE,
        4100000
    ),
    (
        9,
        'Sonic 4 - Teaser',
        'https://youtube.com/watch?v=sonic4_teaser',
        90,
        'teaser',
        'English',
        FALSE,
        1200000
    );
-- ========================================
-- SHOWTIMES DATA
-- ========================================
INSERT INTO showtimes (
        movie_id,
        screen_id,
        show_date,
        show_time,
        price,
        available_seats
    )
VALUES -- Tensura Movie 2 at Downtown Cinema
    (1, 1, '2025-12-03', '18:00', 12.99, 180),
    (1, 1, '2025-12-03', '20:30', 12.99, 160),
    (1, 2, '2025-12-03', '19:00', 14.99, 140),
    -- Spider-Verse at Plaza Theater
    (2, 6, '2025-12-04', '17:00', 12.99, 170),
    (2, 6, '2025-12-04', '19:30', 12.99, 145),
    (2, 7, '2025-12-04', '21:00', 14.99, 130),
    -- Dune 2 at City Center
    (3, 11, '2025-12-04', '16:00', 14.99, 150),
    (3, 11, '2025-12-04', '19:00', 14.99, 125),
    -- Sonic 4 at Downtown
    (9, 3, '2025-12-05', '15:00', 10.99, 160),
    (9, 3, '2025-12-05', '17:00', 10.99, 175),
    (9, 3, '2025-12-05', '19:00', 12.99, 140);
-- ========================================
-- SEATS DATA (Auto-generated in actual setup)
-- ========================================
-- This is handled by triggers in the original script
-- INSERT INTO seats is done via CROSS JOIN in the schema setup
-- ========================================
-- TICKETS DATA
-- ========================================
INSERT INTO tickets (
        showtime_id,
        user_id,
        seat_number,
        ticket_type,
        price_paid,
        status
    )
VALUES (1, 2, 'A1', 'adult', 12.99, 'paid'),
    (1, 2, 'A2', 'adult', 12.99, 'paid'),
    (1, 3, 'A3', 'student', 9.99, 'paid'),
    (1, 4, 'A4', 'adult', 12.99, 'paid'),
    (2, 5, 'B1', 'adult', 12.99, 'paid'),
    (2, 6, 'B2', 'adult', 12.99, 'paid'),
    (3, 7, 'C3', 'child', 8.99, 'booked'),
    (4, 2, 'D4', 'adult', 12.99, 'paid'),
    (4, 3, 'D5', 'student', 9.99, 'paid'),
    (5, 4, 'E1', 'adult', 12.99, 'cancelled');
-- ========================================
-- PAYMENTS DATA
-- ========================================
INSERT INTO payments (
        ticket_id,
        user_id,
        amount,
        payment_method,
        payment_status,
        transaction_id
    )
VALUES (
        1,
        2,
        12.99,
        'credit_card',
        'completed',
        'TRX_20251203_001'
    ),
    (
        2,
        2,
        12.99,
        'credit_card',
        'completed',
        'TRX_20251203_002'
    ),
    (
        3,
        3,
        9.99,
        'debit_card',
        'completed',
        'TRX_20251203_003'
    ),
    (
        4,
        4,
        12.99,
        'credit_card',
        'completed',
        'TRX_20251203_004'
    ),
    (
        5,
        5,
        12.99,
        'paypal',
        'completed',
        'TRX_20251204_001'
    ),
    (
        6,
        6,
        12.99,
        'credit_card',
        'completed',
        'TRX_20251204_002'
    ),
    (
        7,
        7,
        8.99,
        'cash',
        'completed',
        'TRX_20251204_003'
    ),
    (
        8,
        2,
        12.99,
        'mobile',
        'completed',
        'TRX_20251204_004'
    ),
    (
        9,
        3,
        9.99,
        'credit_card',
        'completed',
        'TRX_20251204_005'
    ),
    (
        10,
        4,
        12.99,
        'credit_card',
        'failed',
        'TRX_20251204_006'
    );
-- ========================================
-- REVIEWS DATA
-- ========================================
INSERT INTO reviews (
        movie_id,
        user_id,
        rating,
        comment,
        is_verified_purchase
    )
VALUES (
        1,
        2,
        5,
        'Amazing animation and storytelling! Absolutely loved it!',
        TRUE
    ),
    (
        2,
        3,
        4,
        'Great action sequences and a solid plot. Highly recommended!',
        TRUE
    ),
    (
        3,
        4,
        5,
        'Visually stunning! One of the best sci-fi movies ever made.',
        TRUE
    ),
    (
        4,
        5,
        4,
        'Good effects and star power, but slightly predictable ending.',
        FALSE
    ),
    (
        5,
        6,
        5,
        'Perfect family entertainment! Elsa and Anna are amazing as always.',
        TRUE
    ),
    (
        6,
        7,
        4,
        'Excellent action and dark atmosphere. Batman at his finest!',
        TRUE
    ),
    (
        9,
        2,
        5,
        'Sonic is faster and funnier than ever! A must-watch for fans.',
        FALSE
    ),
    (
        1,
        3,
        4,
        'Very enjoyable. Great voice acting and character development.',
        TRUE
    ),
    (
        2,
        4,
        5,
        'Mind-blowing animation! This is the future of cinema.',
        TRUE
    ),
    (
        3,
        5,
        4,
        'Epic scale and incredible visuals. Slightly long but worth it.',
        TRUE
    );
-- ========================================
-- PROMOTIONS DATA
-- ========================================
INSERT INTO promotions (
        title,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
        code,
        status,
        promotion_type
    )
VALUES (
        'Black Friday Special',
        '25% off all tickets this Black Friday weekend',
        'percentage',
        25,
        '2025-11-28',
        '2025-11-30',
        'BF25',
        'active',
        'seasonal'
    ),
    (
        'Student Discount',
        '20% off with valid student ID year-round',
        'percentage',
        20,
        '2025-01-01',
        '2025-12-31',
        'STUDENT20',
        'active',
        'general'
    ),
    (
        'Holiday Sale',
        '15% off all tickets during the holiday season',
        'percentage',
        15,
        '2025-12-20',
        '2026-01-02',
        'HOLIDAY15',
        'active',
        'seasonal'
    ),
    (
        'Early Bird Special',
        'Save $3 on matinee showings before 5 PM',
        'fixed_amount',
        3,
        '2025-01-01',
        '2025-12-31',
        'EARLY3',
        'active',
        'general'
    ),
    (
        'Happy Birthday!',
        '30% off on your birthday - our gift to you!',
        'percentage',
        30,
        CURDATE(),
        CURDATE(),
        'BIRTHDAY30',
        'active',
        'birthday'
    ),
    (
        'Weekend Matinee',
        '$2 off weekend matinee shows',
        'fixed_amount',
        2,
        '2025-12-01',
        '2025-12-31',
        'MATINEE2',
        'active',
        'general'
    ),
    (
        'New Year Special',
        'Buy 3 tickets, get 1 free in January',
        'percentage',
        25,
        '2026-01-01',
        '2026-01-31',
        'NEWYEAR25',
        'inactive',
        'seasonal'
    );
-- ========================================
-- BOOKMARKS DATA
-- ========================================
INSERT INTO bookmarks (user_id, movie_id)
VALUES (2, 1),
    (2, 2),
    (2, 3),
    (2, 4),
    (3, 1),
    (3, 5),
    (3, 9),
    (4, 2),
    (4, 6),
    (5, 3),
    (5, 4),
    (6, 7),
    (6, 9),
    (7, 4),
    (7, 5),
    (7, 10);
-- ========================================
-- QUERY TO CHECK IF USER HAS BIRTHDAY TODAY
-- ========================================
SELECT u.user_id,
    u.username,
    u.email,
    u.date_of_birth,
    YEAR(CURDATE()) - YEAR(u.date_of_birth) as age,
    p.promotion_id,
    p.title,
    p.code,
    p.discount_value,
    p.discount_type,
    CONCAT(
        p.discount_value,
        IF(p.discount_type = 'percentage', '%', '$')
    ) as discount_display
FROM users u
    LEFT JOIN promotions p ON p.promotion_type = 'birthday'
    AND p.status = 'active'
    AND CURDATE() BETWEEN p.start_date AND p.end_date
WHERE DATE_FORMAT(u.date_of_birth, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
    AND u.status = 'active';
-- ========================================
-- VIEW: BIRTHDAY PROMOTIONS FOR TODAY
-- ========================================
CREATE OR REPLACE VIEW birthday_users_today AS
SELECT u.user_id,
    u.username,
    u.email,
    u.date_of_birth,
    YEAR(CURDATE()) - YEAR(u.date_of_birth) as age,
    p.promotion_id,
    p.title,
    p.description,
    p.discount_type,
    p.discount_value,
    p.code,
    CONCAT(
        p.discount_value,
        IF(p.discount_type = 'percentage', '%', '$')
    ) as discount_display
FROM users u
    INNER JOIN promotions p ON p.promotion_type = 'birthday'
WHERE DATE_FORMAT(u.date_of_birth, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
    AND u.status = 'active'
    AND p.status = 'active'
    AND CURDATE() BETWEEN p.start_date AND p.end_date;
-- ========================================
-- QUERY ALL USERS WITH BIRTHDAYS THIS MONTH
-- ========================================
SELECT u.user_id,
    u.username,
    u.email,
    u.date_of_birth,
    DAY(u.date_of_birth) as birthday_day,
    MONTH(u.date_of_birth) as birthday_month
FROM users u
WHERE MONTH(u.date_of_birth) = MONTH(CURDATE())
    AND u.status = 'active'
ORDER BY DAY(u.date_of_birth);
-- ========================================
-- PROCEDURE: GET USER BIRTHDAY PROMO
-- ========================================
DELIMITER $$ CREATE PROCEDURE get_user_birthday_promo(IN p_user_id INT) BEGIN
SELECT u.user_id,
    u.username,
    u.email,
    u.date_of_birth,
    YEAR(CURDATE()) - YEAR(u.date_of_birth) as age,
    CASE
        WHEN DATE_FORMAT(u.date_of_birth, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d') THEN 'TODAY'
        ELSE 'NOT TODAY'
    END as birthday_status,
    p.promotion_id,
    p.title,
    p.code,
    p.discount_value,
    p.discount_type,
    CONCAT(
        p.discount_value,
        IF(p.discount_type = 'percentage', '%', '$')
    ) as discount_display
FROM users u
    LEFT JOIN promotions p ON p.promotion_type = 'birthday'
    AND p.status = 'active'
    AND CURDATE() BETWEEN p.start_date AND p.end_date
WHERE u.user_id = p_user_id;
END $$ DELIMITER;
-- ========================================
-- PROCEDURE: CHECK IF USER HAS BIRTHDAY TODAY
-- ========================================
DELIMITER $$ CREATE PROCEDURE check_user_birthday(IN p_user_id INT, OUT is_birthday BOOLEAN) BEGIN
SELECT DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d') INTO is_birthday
FROM users
WHERE user_id = p_user_id;
END $$ DELIMITER;
-- ========================================
-- PROCEDURE: APPLY BIRTHDAY DISCOUNT TO TICKET
-- ========================================
DELIMITER $$ CREATE PROCEDURE apply_birthday_discount(
    IN p_user_id INT,
    IN p_ticket_price DECIMAL(10, 2),
    OUT p_discounted_price DECIMAL(10, 2),
    OUT p_discount_amount DECIMAL(10, 2),
    OUT has_birthday BOOLEAN
) BEGIN
DECLARE promo_discount_value DECIMAL(10, 2);
DECLARE promo_discount_type VARCHAR(20);
-- Check if user has birthday today
SELECT DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d') INTO has_birthday
FROM users
WHERE user_id = p_user_id;
-- Get birthday promotion details
SELECT p.discount_value,
    p.discount_type INTO promo_discount_value,
    promo_discount_type
FROM promotions p
WHERE p.promotion_type = 'birthday'
    AND p.status = 'active'
    AND CURDATE() BETWEEN p.start_date AND p.end_date
LIMIT 1;
-- Calculate discount if birthday today
IF has_birthday
AND promo_discount_value IS NOT NULL THEN IF promo_discount_type = 'percentage' THEN
SET p_discount_amount = p_ticket_price * (promo_discount_value / 100);
ELSE
SET p_discount_amount = promo_discount_value;
END IF;
SET p_discounted_price = p_ticket_price - p_discount_amount;
ELSE
SET p_discount_amount = 0;
SET p_discounted_price = p_ticket_price;
END IF;
END $$ DELIMITER;
-- ========================================
-- TEST DATA: USER WITH TODAY'S BIRTHDAY
-- ========================================
-- Update a user to have today's birthday (for testing)
UPDATE users
SET date_of_birth = DATE_SUB(CURDATE(), INTERVAL YEAR(CURDATE()) - 1995 YEAR)
WHERE user_id = 6;
-- customer_bob
-- ========================================
-- TEST QUERIES
-- ========================================
-- Check today's birthday users
SELECT *
FROM birthday_users_today;
-- Get specific user's birthday promotion
CALL get_user_birthday_promo(6);
-- Check if user 6 has birthday today
CALL check_user_birthday(6, @is_birthday);
SELECT @is_birthday as has_birthday_today;
-- Apply birthday discount to ticket
CALL apply_birthday_discount(6, 12.99, @discounted, @discount, @is_bday);
SELECT @is_bday as has_birthday,
    12.99 as original_price,
    @discount as discount_amount,
    @discounted as final_price;
-- ========================================
-- TRIGGER: AUTO-CREATE BIRTHDAY PROMO DAILY
-- ========================================
DELIMITER $$ CREATE TRIGGER create_daily_birthday_promotion BEFORE
INSERT ON promotions FOR EACH ROW BEGIN -- This trigger ensures birthday promotion is always available
    IF NEW.promotion_type = 'birthday' THEN
SET NEW.start_date = CURDATE();
SET NEW.end_date = CURDATE();
END IF;
END $$ DELIMITER;
-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Show all active promotions
SELECT promotion_id,
    title,
    description,
    code,
    discount_value,
    discount_type,
    promotion_type,
    start_date,
    end_date,
    status
FROM promotions
WHERE status = 'active'
ORDER BY promotion_type;
-- Show birthday promotion specifically
SELECT promotion_id,
    title,
    code,
    discount_value,
    discount_type,
    start_date,
    end_date
FROM promotions
WHERE promotion_type = 'birthday';
-- Count users with birthdays by month
SELECT MONTH(date_of_birth) as month,
    COUNT(*) as user_count
FROM users
WHERE status = 'active'
GROUP BY MONTH(date_of_birth)
ORDER BY month;
-- ========================================
-- SCHEMA CREATION COMPLETE
-- ========================================
SELECT 'All tables created successfully!' as Status;