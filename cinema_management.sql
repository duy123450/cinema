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
    end_date DATE,
    director VARCHAR(100),
    genre VARCHAR(100),
    language VARCHAR(50) DEFAULT 'English',
    rating ENUM('G', 'PG', 'PG-13', 'R', 'NC-17', 'NR') DEFAULT 'PG-13',
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
-- ACTORS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS actors (
    actor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    bio TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- MOVIE_CAST TABLE (Junction Table)
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
-- MOVIE_TRAILERS TABLE
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
-- CONCESSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS concessions (
    concession_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('popcorn', 'drink', 'combo', 'snack', 'candy') NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- TICKET_CONCESSIONS TABLE (Junction Table)
-- ========================================
CREATE TABLE IF NOT EXISTS ticket_concessions (
    ticket_concession_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    concession_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (concession_id) REFERENCES concessions(concession_id) ON DELETE CASCADE
);

-- ========================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_movies_release_date ON movies(release_date);
CREATE INDEX idx_movies_end_date ON movies(end_date);
CREATE INDEX idx_movies_status_release_date ON movies(status, release_date);
CREATE INDEX idx_movies_status_end_date ON movies(status, end_date);
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
CREATE INDEX idx_concessions_category ON concessions(category);
CREATE INDEX idx_concessions_available ON concessions(is_available);
CREATE INDEX idx_ticket_concessions_ticket ON ticket_concessions(ticket_id);
CREATE INDEX idx_ticket_concessions_concession ON ticket_concessions(concession_id);

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
VALUES 
    -- Tensura Movie 2
    (
        'Rimuru Tempest',
        'Protagonist: powerful slime reborn with memories.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/q2CqzdaaxHrpH1SKlqjKOBKCUEm.jpg'
    ),
    (
        'Benimaru',
        'Demon warrior, loyal general under Rimuru.',
        NULL
    ),
    (
        'Shion',
        'Oni maid and bodyguard to Rimuru.',
        NULL
    ),
    (
        'Hiiro',
        'Harpy warrior appearing in the Tensura movie.',
        NULL
    ),
    (
        'Veldora Tempest',
        'Storm Dragon and ancient friend of Rimuru.',
        NULL
    ),
    -- Spider-Man: Across the Spider-Verse
    (
        'Miles Morales',
        'Spider-Man from an alternate universe.',
        NULL
    ),
    (
        'Gwen Stacy',
        'Spider-Gwen from another universe.',
        NULL
    ),
    (
        'Peter B. Parker',
        'Alternate-universe Spider-Man (mentor variant).',
        NULL
    ),
    (
        'Spider-Man 2099',
        'Future Spider-Man, part of the Spider Society.',
        NULL
    ),
    -- Dune Part Two
    (
        'Paul Atreides',
        'Heir of House Atreides, destined ruler.',
        NULL
    ),
    (
        'Lady Jessica',
        'Bene Gesserit adept, mother of Paul.',
        NULL
    ),
    ('Chani', 'Fremen warrior and Paul’s ally.', NULL),
    (
        'Duncan Idaho',
        'Loyal Atreides swordsman.',
        NULL
    ),
    -- Avengers: Endgame
    (
        'Iron Man',
        'Genius inventor and Avenger of Earth.',
        NULL
    ),
    (
        'Captain America',
        'Super-soldier and symbol of hope.',
        NULL
    ),
    (
        'Thor',
        'God of Thunder and protector of realms.',
        NULL
    ),
    (
        'Black Widow',
        'Spy, Avenger, master tactician.',
        NULL
    ),
    -- Frozen II
    (
        'Elsa',
        'Ice queen with powers over ice and snow.',
        NULL
    ),
    ('Anna', 'Brave sister of Elsa.', NULL),
    ('Olaf', 'Friendly living snowman.', NULL),
    -- The Batman (2022)
    (
        'Bruce Wayne',
        'The Batman, vigilante protector of Gotham.',
        NULL
    ),
    (
        'Selina Kyle',
        'Catwoman — skilled burglar and anti-hero.',
        NULL
    ),
    (
        'The Riddler',
        'Gotham criminal mastermind.',
        NULL
    ),
    -- One Piece Film: Red
    (
        'Monkey D. Luffy',
        'Captain of the Straw Hat Pirates.',
        NULL
    ),
    (
        'Shanks',
        'Legendary pirate, powerful and influential.',
        NULL
    ),
    (
        'Uta',
        'Singer and key figure in the Red storyline.',
        NULL
    ),
    -- Harry Potter (2001)
    (
        'Daniel Radcliffe',
        'British actor best known for portraying Harry Potter.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/nHk7v5HfLCPYHwBtLPQ3OP8cA4E.jpg'
    ),
    (
        'Emma Watson',
        'Actress known globally for her role as Hermione Granger.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/2Xf8oHtj0nPc2sRkJq0uEn5Gg8g.jpg'
    ),
    (
        'Rupert Grint',
        'English actor who portrayed Ron Weasley in the Harry Potter series.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/jr6F7g90S5MoA37Y3zhGEylhmAQ.jpg'
    ),
    (
        'Alan Rickman',
        'Legendary actor known for his portrayal of Severus Snape.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/q2zLgOvwxWQfL0eJi2yXzuT50gp.jpg'
    ),
    -- Mario Movie Universe
    (
        'Mario',
        'Heroic plumber from the Mushroom Kingdom.',
        NULL
    ),
    (
        'Luigi',
        'Mario’s younger brother and companion.',
        NULL
    ),
    (
        'Bowser',
        'King of the Koopas, main antagonist.',
        NULL
    ),
    -- Godzilla × Kong Universe
    (
        'Godzilla',
        'King of the Monsters — colossal Titan.',
        NULL
    ),
    (
        'Kong',
        'Guardian Titan from Skull Island.',
        NULL
    ),
    ('Mechagodzilla', 'Robotic Titan threat.', NULL),
    -- Avatar Universe
    (
        'Jake Sully',
        'Na’vi Marine turned Avatar warrior.',
        NULL
    ),
    (
        'Neytiri',
        'Na’vi princess, skilled warrior and guide.',
        NULL
    ),
    (
        'Toruk Makto',
        'Legendary Na’vi sky-rider leader.',
        NULL
    ),
    -- John Wick: Chapter 4 (2023)
    (
        'Keanu Reeves',
        'Canadian actor known for playing John Wick.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg'
    ),
    (
        'Donnie Yen',
        'Actor and martial artist known for John Wick: Chapter 4 and Ip Man.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/7iHuccSi7uECgCHCtszzZJKUBGc.jpg'
    ),
    (
        'Bill Skarsgård',
        'Actor who portrayed the Marquis in John Wick: Chapter 4.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/oWnYQnVnq1JN2nDSEfjT88j4A5J.jpg'
    ),
    (
        'Laurence Fishburne',
        'Actor known for Bowery King and Morpheus roles.',
        'https://media.themoviedb.org/t/p/w300_and_h450_face/6uW9aYI2jUwBfQeWGk8Z88twyl5.jpg'
    ),
    -- Oppenheimer Cast
    (
        'Cillian Murphy',
        'Irish actor, known for his roles in Batman Begins and as J. Robert Oppenheimer.',
        NULL
    ),
    (
        'Emily Blunt',
        'British actress, known for her roles in Edge of Tomorrow and as Kitty Oppenheimer.',
        NULL
    ),
    -- Barbie Cast
    (
        'Margot Robbie',
        'Australian actress and producer, known for her roles in The Wolf of Wall Street and as Barbie.',
        NULL
    ),
    (
        'Ryan Gosling',
        'Canadian actor, known for his roles in La La Land and as Ken in Barbie.',
        NULL
    ),
    -- Vua Của Các Vua (King of Kings)
    (
        'Jang Seong-ho',
        'Director and screenwriter for "Vua Của Các Vua" (King of Kings).',
        NULL
    ),
    (
        'Charles Dickens (Character)',
        'The renowned novelist who tells the story of Jesus to his son, Walter.',
        NULL
    ),
    (
        'Walter Dickens (Character)',
        'Charles Dickens'' son, who experiences the story of Jesus through his imagination.',
        NULL
    ),
    -- Zootopia 2 Crew/Cast
    (
        'Byron Howard',
        'American animator, director, producer, screenwriter, and voice actor. Known for directing Zootopia and Zootopia 2.',
        NULL
    ),
    (
        'Ginnifer Goodwin',
        'American actress, known for voicing Judy Hopps in Zootopia.',
        NULL
    ),
    (
        'Jason Bateman',
        'American actor, known for voicing Nick Wilde in Zootopia.',
        NULL
    ),
    (
        'Idris Elba',
        'British actor, known for voicing Chief Bogo in Zootopia.',
        NULL
    ),
    -- 5 Centimeters Per Second Crew/Cast
    (
        'Makoto Shinkai',
        'Japanese animator, filmmaker, author, and director of 5 Centimeters Per Second.',
        NULL
    ),
    (
        'Kenji Mizuhashi',
        'Japanese actor, known for voicing Takaki Tono in 5 Centimeters Per Second.',
        NULL
    ),
    (
        'Yoshimi Kondo',
        'Japanese actress, known for voicing Akari Shinohara in 5 Centimeters Per Second.',
        NULL
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
        end_date,
        director,
        genre,
        language,
        rating,
        imdb_rating,
        poster_url,
        status
    )
VALUES 
    -- 1. That Time I Got Reincarnated as a Slime the Movie: Tears of the Azure Sea
    (
        'That Time I Got Reincarnated as a Slime the Movie: Tears of the Azure Sea',
        'Tensei Shitara Slime Datta Ken Movie: Guren no Kizuna-hen',
        'After concluding the opening ceremony of the Demon Kingdom Federation Tempest, Rimuru and his companions are invited by the Celestial Emperor Hermesia of the great elven nation - the Magi Dynasty Salion - to visit her private resort island. As the group enjoys their brief vacation, a mysterious woman named Yura appears. A new incident unfolds against the backdrop of the boundless azure sea.',
        120,
        '2026-02-27',
        '2026-04-24',
        'Yasuhito Kikuchi',
        'Animation/Fantasy',
        'Japanese',
        'PG-13',
        6.6,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/q2CqzdaaxHrpH1SKlqjKOBKCUEm.jpg',
        'upcoming'
    ),
    -- 2. Spider-Man: Across the Spider-Verse
    (
        'Spider-Man: Across the Spider-Verse',
        'Spider-Man: Across the Spider-Verse',
        'Miles Morales ventures across the Spider-Verse in an epic animated adventure.',
        140,
        '2023-06-02',
        '2023-09-01',
        'Joaquim Dos Santos, Justin K. Thompson, Kemp Powers',
        'Animation/Action',
        'English',
        'PG',
        8.6,
        'https://media.themoviedb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        'ended'
    ),
    -- 3. Dune: Part Two
    (
        'Dune: Part Two',
        'Dune: Part Two',
        'Paul Atreides travels to the dangerous planet Arrakis to fulfill a dangerous prophecy.',
        166,
        '2024-03-01',
        '2024-05-24',
        'Denis Villeneuve',
        'Sci-Fi/Drama',
        'English',
        'PG-13',
        8.3,
        'https://media.themoviedb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        'ended'
    ),
    -- 4. Avengers: Endgame
    (
        'Avengers: Endgame',
        'Avengers: Endgame',
        'The Earth''s mightiest heroes reunite for one final stand against cosmic forces.',
        150,
        '2019-04-26',
        '2019-07-19',
        'Russo Brothers',
        'Action/Adventure',
        'English',
        'PG-13',
        8.4,
        'https://media.themoviedb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        'ended'
    ),
    -- 5. Frozen II
    (
        'Frozen II',
        'Frozen II',
        'Elsa and Anna embark on a magical journey beyond Arendelle''s borders.',
        120,
        '2019-11-22',
        '2020-01-17',
        'Chris Buck',
        'Animation/Fantasy',
        'English',
        'PG',
        6.8,
        'https://media.themoviedb.org/t/p/w500/pjeMs3yqRmFL3giJy4PMXWZTTPa.jpg',
        'ended'
    ),
    -- 6. The Batman (2022)
    (
        'The Batman',
        'The Batman',
        'The Dark Knight rises again to face a new threat to Gotham City.',
        155,
        '2022-03-04',
        '2022-05-27',
        'Matt Reeves',
        'Action/Crime',
        'English',
        'PG-13',
        7.8,
        'https://media.themoviedb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        'ended'
    ),
    -- 7. One Piece Film: Red
    (
        'One Piece Film: Red',
        'One Piece Film: Red',
        'A new adventure emerges in the world of pirates.',
        125,
        '2022-08-06',
        '2022-09-30',
        'Goro Taniguchi',
        'Animation/Adventure',
        'Japanese',
        'PG-13',
        7.4,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/m80kPdrmmtEh9wlLroCp0bwUGH0.jpg',
        'ended'
    ),
    -- 8. Harry Potter and the Sorcerer's Stone
    (
        'Harry Potter and the Sorcerer''s Stone',
        'Harry Potter and the Sorcerer''s Stone',
        'A young wizard begins his magical journey at Hogwarts School of Witchcraft and Wizardry.',
        180,
        '2001-11-16',
        '2002-02-08',
        'Chris Columbus',
        'Fantasy/Adventure',
        'English',
        'PG',
        7.6,
        'https://media.themoviedb.org/t/p/w500/c54HpQmuwXjHq2C9wmoACjxoom3.jpg',
        'ended'
    ),
    -- 9. Sonic the Hedgehog 2
    (
        'Sonic the Hedgehog 2',
        'Sonic the Hedgehog 2',
        'The blue speedster returns for a high-octane adventure.',
        115,
        '2022-04-08',
        '2022-06-17',
        'Jeff Fowler',
        'Action/Adventure',
        'English',
        'PG',
        6.5,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/3eh7j7zVOc4ZRtOrduYnaWD9mYJ.jpg',
        'ended'
    ),
    -- 10. Godzilla x Kong: The New Empire
    (
        'Godzilla x Kong: The New Empire',
        'Godzilla x Kong: The New Empire',
        'Two titans battle in an epic showdown.',
        160,
        '2024-03-29',
        '2024-05-24',
        'Adam Wingard',
        'Action/Sci-Fi',
        'English',
        'PG-13',
        6.3,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/lTpnAtn1hWXDLxEmkD28l6UyPlF.jpg',
        'ended'
    ),
    -- 11. The Super Mario Bros. Movie
    (
        'The Super Mario Bros. Movie',
        'The Super Mario Bros. Movie',
        'Mario and friends embark on a wild adventure in the Mushroom Kingdom.',
        110,
        '2023-04-05',
        '2023-07-05',
        'Aaron Horvath',
        'Animation/Comedy',
        'English',
        'PG',
        7.0,
        'https://media.themoviedb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
        'ended'
    ),
    -- 12. Avatar: The Way of Water
    (
        'Avatar: The Way of Water',
        'Avatar: The Way of Water',
        'Return to the world of Pandora for a new chapter of discovery and conflict.',
        180,
        '2022-12-16',
        '2023-03-24',
        'James Cameron',
        'Sci-Fi/Adventure',
        'English',
        'PG-13',
        7.6,
        'https://media.themoviedb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        'ended'
    ),
    -- 13. John Wick: Chapter 4
    (
        'John Wick: Chapter 4',
        'John Wick: Chapter 4',
        'The legendary assassin embarks on his next mission.',
        145,
        '2023-03-24',
        '2023-06-09',
        'Chad Stahelski',
        'Action/Thriller',
        'English',
        'R',
        7.7,
        'https://media.themoviedb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
        'ended'
    ),
    -- 14. Oppenheimer
    (
        'Oppenheimer',
        'Oppenheimer',
        'The story of J. Robert Oppenheimer, the theoretical physicist whose landmark work as the director of the Manhattan Project created the first atomic bomb.',
        180,
        '2023-07-21',
        '2023-10-13',
        'Christopher Nolan',
        'Biography/Drama/Thriller',
        'English',
        'R',
        8.4,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/ecYTEmn3JBZyWbqwzjmBFfGvi3U.jpg',
        'ended'
    ),
    -- 15. Barbie
    (
        'Barbie',
        'Barbie',
        'Barbie suffers an existential crisis and travels to the real world to find true happiness.',
        114,
        '2023-07-21',
        '2023-10-13',
        'Greta Gerwig',
        'Comedy/Fantasy/Adventure',
        'English',
        'PG-13',
        6.9,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/mqNkQhaXxsH8SLNmJnG5oGz4meR.jpg',
        'ended'
    ),
    -- 16. Vua của các vua (NEW MOVIE - Fictional Upcoming Release)
    (
        'Vua Của Các Vua',
        'King of Kings',
        'Trong một đêm yên bình, Charles Dickens kể cho con trai mình - cậu bé Walter - nghe câu chuyện vĩ đại nhất mọi thời đại. Nhưng câu chuyện ấy không chỉ dừng lại ở lời kể. Với trí tưởng tượng bay bổng, Walter bước vào thế giới của Chúa Giê-su – tận mắt chứng kiến những phép màu, cảm nhận nỗi đau của Ngài, và học được bài học sâu sắc nhất về tình yêu và sự hy sinh. Một câu chuyện về đức tin, sự cảm thông, và hành trình trưởng thành bắt đầu... từ chính trái tim của một người cha.',
        102,
        -- 1h 42m
        '2025-12-12',
        '2026-02-06',
        -- ~8 weeks run
        'Jang Seong-ho',
        'Phim Hoạt Hình, Phim Gia Đình, Phim Tưởng, Phim Chính Kịch, Phim Phiêu Lưu',
        'Vietnamese',
        'PG-13',
        8.5,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/jZB7mY36lcgaAdfnD3pSEsRWrp4.jpg',
        'upcoming'
    ),
    -- 17. Zootopia 2
    (
        'Zootopia 2',
        'Zootopia 2',
        'Judy Hopps and Nick Wilde return to solve a new, complex case that threatens the peace of their urban world.',
        115,
        '2025-11-28',
        '2026-01-09',
        'Byron Howard',
        'Animation/Adventure/Comedy',
        'English',
        'PG',
        8.0,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/5wXpOF9WPUKliIzNBdAqwAStLHU.jpg',
        'now_showing'
    ),
    -- 18. 5 Centimeters Per Second
    (
        '5 Centimeters Per Second',
        'Byōsoku Go Senchimētoru',
        'An episodic look at the relationship between Takaki Tono and Akari Shinohara, separated by time and distance.',
        63,
        '2025-12-05',
        '2026-01-20',
        'Makoto Shinkai',
        'Animation/Romance/Drama',
        'Japanese',
        'PG-13',
        7.6,
        'https://media.themoviedb.org/t/p/w300_and_h450_face/7NhKe7yaadEmS0w6LVQdBdTgeux.jpg',
        'now_showing'
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
VALUES -- 1. Tensura Movie 2
    (1, 1, 'Rimuru Tempest', 'lead', 1),
    (1, 2, 'Benimaru', 'supporting', 2),
    (1, 3, 'Shion', 'supporting', 3),
    (1, 4, 'Hiiro', 'supporting', 4),
    (1, 5, 'Veldora Tempest', 'cameo', 5),
    -- 2. Spider-Man: Across the Spider-Verse
    (2, 6, 'Miles Morales', 'lead', 1),
    (2, 7, 'Gwen Stacy', 'supporting', 2),
    (2, 8, 'Peter B. Parker', 'supporting', 3),
    (2, 9, 'Spider-Man 2099', 'supporting', 4),
    -- 3. Dune: Part Two
    (3, 10, 'Paul Atreides', 'lead', 1),
    (3, 11, 'Lady Jessica', 'supporting', 2),
    (3, 12, 'Chani', 'supporting', 3),
    (3, 13, 'Duncan Idaho', 'cameo', 4),
    -- 4. Avengers: Endgame
    (4, 14, 'Iron Man', 'lead', 1),
    (4, 15, 'Captain America', 'lead', 2),
    (4, 16, 'Thor', 'supporting', 3),
    (4, 17, 'Black Widow', 'supporting', 4),
    -- 5. Frozen II
    (5, 18, 'Elsa', 'lead', 1),
    (5, 19, 'Anna', 'lead', 2),
    (5, 20, 'Olaf', 'supporting', 3),
    -- 6. The Batman (2022)
    (6, 21, 'Bruce Wayne / Batman', 'lead', 1),
    (6, 22, 'Selina Kyle / Catwoman', 'supporting', 2),
    (6, 23, 'The Riddler', 'supporting', 3),
    -- 7. One Piece Film: Red
    (7, 24, 'Monkey D. Luffy', 'lead', 1),
    (7, 25, 'Shanks', 'supporting', 2),
    (7, 26, 'Uta', 'lead', 3),
    -- Harry Potter and the Sorcerer's Stone
    (8, 36, 'Harry Potter', 'lead', 1),
    (8, 37, 'Hermione Granger', 'supporting', 2),
    (8, 38, 'Ron Weasley', 'supporting', 3),
    (8, 39, 'Severus Snape', 'supporting', 4),
    -- 9. Sonic the Hedgehog 2
    (9, 27, 'Sonic the Hedgehog', 'lead', 1),
    (9, 28, 'Mario', 'cameo', 2),
    (9, 29, 'Luigi', 'cameo', 3),
    -- 10. Godzilla x Kong: The New Empire
    (10, 30, 'Godzilla', 'lead', 1),
    (10, 31, 'Kong', 'lead', 2),
    (10, 32, 'Mechagodzilla', 'supporting', 3),
    -- 11. The Super Mario Bros. Movie
    (11, 28, 'Mario', 'lead', 1),
    (11, 29, 'Luigi', 'supporting', 2),
    (11, 30, 'Bowser', 'lead', 3),
    -- 12. Avatar: The Way of Water
    (12, 33, 'Jake Sully', 'lead', 1),
    (12, 34, 'Neytiri', 'lead', 2),
    (12, 35, 'Toruk Makto', 'supporting', 3),
    -- 13. John Wick: Chapter 4
    (13, 40, 'John Wick', 'lead', 1),
    (13, 41, 'Caine', 'supporting', 2),
    (
        13,
        42,
        'Marquis Vincent de Gramont',
        'supporting',
        3
    ),
    (13, 43, 'Bowery King', 'supporting', 4),
    -- 14. Oppenheimer
    (14, 53, 'J. Robert Oppenheimer', 'lead', 1),
    (14, 54, 'Kitty Oppenheimer', 'lead', 2),
    -- 15. Barbie
    (15, 55, 'Barbie', 'lead', 1),
    (15, 56, 'Ken', 'lead', 2),
    -- 16. Vua Của Các Vua (King of Kings)
    (16, 46, 'Charles Dickens', 'lead', 1),
    (16, 47, 'Walter', 'lead', 2),
    -- 17. Zootopia 2
    (17, 48, 'Judy Hopps', 'lead', 1),
    (17, 49, 'Nick Wilde', 'lead', 2),
    (17, 50, 'Chief Bogo', 'supporting', 3),
    -- 18. 5 Centimeters Per Second
    (18, 51, 'Takaki Tono', 'lead', 1),
    (18, 52, 'Akari Shinohara', 'lead', 2);

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
VALUES 
    -- That Time I Got Reincarnated as a Slime the Movie: Tears of the Azure Sea trailers (Movie ID 1)
    (
        1,
        'Azure Sea - Official Trailer',
        'https://youtu.be/q6YZQqxcS30?si=d8lh-nAN7-kfL8Wz',
        120,
        'official',
        'Japanese',
        TRUE,
        2500000
    ),
    (
        1,
        'Azure Sea - Teaser Trailer',
        'https://youtu.be/kJ-0GbqfuYY?si=25cf5bujIx9CROtj',
        60,
        'teaser',
        'Japanese',
        FALSE,
        850000
    ),
    (
        1,
        'Azure Sea - Behind the Scenes',
        'https://www.youtube.com/watch?v=azure_sea_bts_2026',
        240,
        'behind_the_scenes',
        'Japanese',
        FALSE,
        420000
    ),
    -- Spider-Verse trailers (Movie ID 2)
    (
        2,
        'Spider-Verse - Official Trailer',
        'https://www.youtube.com/watch?v=UUqUZ7uumqE',
        240,
        'official',
        'English',
        TRUE,
        3200000
    ),
    (
        2,
        'Spider-Verse - Teaser',
        'https://www.youtube.com/watch?v=UUqUZ7uumqE',
        120,
        'teaser',
        'English',
        FALSE,
        1100000
    ),
    -- Dune: Part Two trailers (Movie ID 3)
    (
        3,
        'Dune Part 2 - Official Trailer',
        'https://www.youtube.com/watch?v=HJp9P3O4JK0',
        180,
        'official',
        'English',
        TRUE,
        5600000
    ),
    (
        3,
        'Dune Part 2 - Special Clip',
        'https://www.youtube.com/watch?v=HJp9P3O4JK0',
        120,
        'clip',
        'English',
        FALSE,
        920000
    ),
    (
        3,
        'Dune Part 2 - Behind the Scenes',
        'https://www.youtube.com/watch?v=HJp9P3O4JK0',
        300,
        'behind_the_scenes',
        'English',
        FALSE,
        780000
    ),
    -- Avengers: Endgame (Movie ID 4)
    (
        4,
        'Avengers: Endgame - Official Trailer',
        'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        150,
        'official',
        'English',
        TRUE,
        90000000
    ),
    -- Frozen II (Movie ID 5)
    (
        5,
        'Frozen 2 | Official Trailer 2',
        'https://www.youtube.com/watch?v=bwzLiQZDw2I',
        138,
        'official',
        'English',
        TRUE,
        42000000
    ),
    -- The Batman (Movie ID 6)
    (
        6,
        'The Batman - Final Trailer',
        'https://www.youtube.com/watch?v=5z98s9SzxSs',
        153,
        'official',
        'English',
        TRUE,
        15000000
    ),
    -- One Piece Film: Red (Movie ID 7)
    (
        7,
        'One Piece Film: Red Trailer #1',
        'https://www.youtube.com/watch?v=4FDeLtjCslo',
        98,
        'official',
        'Japanese',
        TRUE,
        8000000
    ),
    -- Harry Potter and the Sorcerer's Stone (Movie ID 8)
    (
        8,
        'Harry Potter and the Sorcerer''s Stone (2001) Official Trailer',
        -- Corrected escape for 's
        'https://www.youtube.com/watch?v=VyHV0BRtdxo',
        130,
        'official',
        'English',
        TRUE,
        18000000
    ),
    -- Sonic the Hedgehog 2 trailers (Movie ID 9)
    (
        9,
        'Sonic the Hedgehog 2 - Official Trailer',
        'https://www.youtube.com/watch?v=rHAI52zXz9A',
        150,
        'official',
        'English',
        TRUE,
        4100000
    ),
    (
        9,
        'Sonic the Hedgehog 2 - Teaser',
        'https://www.youtube.com/watch?v=rHAI52zXz9A',
        90,
        'teaser',
        'English',
        FALSE,
        1200000
    ),
    -- Godzilla x Kong: The New Empire (Movie ID 10)
    (
        10,
        'GODZILLA X KONG: The New Empire Trailer 3',
        'https://www.youtube.com/watch?v=bsa9LgJBU34',
        146,
        'official',
        'English',
        TRUE,
        28000000
    ),
    -- The Super Mario Bros. Movie (Movie ID 11)
    (
        11,
        'THE SUPER MARIO BROS. MOVIE Super Bowl Trailer',
        'https://www.youtube.com/watch?v=RaDRlUB1uu8&vl=en',
        61,
        'official',
        'English',
        TRUE,
        55000000
    ),
    -- Avatar: The Way of Water (Movie ID 12)
    (
        12,
        'Avatar: The Way of Water | Official Trailer',
        'https://www.youtube.com/watch?v=d9MyW72ELq0',
        135,
        'official',
        'English',
        TRUE,
        45000000
    ),
    -- John Wick: Chapter 4 (Movie ID 13)
    (
        13,
        'John Wick: Chapter 4 (2023) Final Trailer',
        'https://www.youtube.com/watch?v=yjRHZEUamCc',
        150,
        'official',
        'English',
        TRUE,
        12000000
    ),
    -- Oppenheimer trailers (Movie ID 14)
    (
        14,
        'Oppenheimer - Official Trailer',
        'https://www.youtube.com/watch?v=hPIzgZ16oac',
        182,
        'official',
        'English',
        TRUE,
        74000000
    ),
    -- Barbie trailers (Movie ID 15)
    (
        15,
        'Barbie - Official Trailer',
        'https://www.youtube.com/watch?v=qcGMKd8iego',
        167,
        'official',
        'English',
        TRUE,
        61000000
    ),
    -- Vua Của Các Vua trailers (Movie ID 16)
    (
        16,
        'Vua Của Các Vua - Official Trailer',
        'https://youtu.be/0kCRLxU4M8Y?si=bDFatgEfaYJ66h-s',
        100,
        'official',
        'Vietnamese',
        TRUE,
        150000
    ),
    -- Zootopia 2 (Movie ID 17)
    (
        17,
        'Zootopia 2 - Official Trailer',
        'https://youtu.be/BjkIOU5PhyQ?si=4duso2W7u_KrEmAs',
        90,
        'teaser',
        'English',
        TRUE,
        5000000
    ),
    -- 5 Centimeters Per Second (Movie ID 18)
    (
        18,
        '5 Centimeters Per Second - Anniversary Trailer',
        'https://youtu.be/PjAcCzgg3pw?si=r-Q1aT3wEL7cQQCb',
        120,
        'official',
        'Japanese',
        TRUE,
        1500000
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
VALUES -- Vua Của Các Vua (Movie 16) - NOW SHOWING
    (16, 1, '2025-12-12', '14:00', 10.99, 190),
    (16, 1, '2025-12-12', '16:30', 10.99, 185),
    (16, 2, '2025-12-12', '19:00', 12.99, 175),
    (16, 8, '2025-12-13', '15:00', 10.99, 180),
    (16, 8, '2025-12-13', '17:30', 10.99, 188),
    (16, 8, '2025-12-13', '20:00', 12.99, 170),
    (16, 11, '2025-12-14', '14:30', 11.99, 185),
    (16, 11, '2025-12-14', '17:00', 11.99, 180),
    -- Zootopia 2 (Movie 17) - NOW SHOWING
    (17, 4, '2025-12-12', '10:00', 9.99, 200),
    (17, 4, '2025-12-12', '12:30', 9.99, 195),
    (17, 4, '2025-12-12', '15:00', 10.99, 190),
    (17, 4, '2025-12-12', '17:30', 10.99, 185),
    (17, 9, '2025-12-13', '10:30', 9.99, 198),
    (17, 9, '2025-12-13', '13:00', 9.99, 192),
    (17, 9, '2025-12-13', '15:30', 10.99, 188),
    (17, 9, '2025-12-13', '18:00', 10.99, 180),
    (17, 12, '2025-12-14', '11:00', 9.99, 195),
    (17, 12, '2025-12-14', '13:30', 9.99, 190),
    (17, 12, '2025-12-14', '16:00', 10.99, 185),
    -- 5 Centimeters Per Second (Movie 18) - NOW SHOWING
    (18, 5, '2025-12-12', '13:00', 11.99, 170),
    (18, 5, '2025-12-12', '15:30', 11.99, 165),
    (18, 5, '2025-12-12', '18:00', 12.99, 160),
    (18, 10, '2025-12-13', '14:00', 11.99, 172),
    (18, 10, '2025-12-13', '16:30', 11.99, 168),
    (18, 10, '2025-12-13', '19:00', 12.99, 155),
    (18, 13, '2025-12-14', '13:30', 11.99, 170),
    (18, 13, '2025-12-14', '16:00', 11.99, 165);

-- ========================================
-- SEATS DATA
-- ========================================
-- seat rows A–I, numbers 1–7
INSERT INTO seats (screen_id, seat_row, seat_number, seat_label)
SELECT s.screen_id,
    r.row_label,
    n.num,
    CONCAT(r.row_label, n.num)
FROM screens s
    CROSS JOIN (
        SELECT 'A' AS row_label
        UNION
        SELECT 'B' AS row_label
        UNION
        SELECT 'C' AS row_label
        UNION
        SELECT 'D' AS row_label
        UNION
        SELECT 'E' AS row_label
        UNION
        SELECT 'F' AS row_label
        UNION
        SELECT 'G' AS row_label
        UNION
        SELECT 'H' AS row_label
        UNION
        SELECT 'I' AS row_label
    ) r
    CROSS JOIN (
        SELECT 1 AS num
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
-- CONCESSIONS DATA
-- ========================================
INSERT INTO concessions (name, category, description, price, is_available)
VALUES -- Popcorn
    (
        'Small Popcorn',
        'popcorn',
        'Fresh buttered popcorn - Small',
        4.50,
        TRUE
    ),
    (
        'Medium Popcorn',
        'popcorn',
        'Fresh buttered popcorn - Medium',
        6.50,
        TRUE
    ),
    (
        'Large Popcorn',
        'popcorn',
        'Fresh buttered popcorn - Large',
        8.50,
        TRUE
    ),
    (
        'Extra Large Popcorn',
        'popcorn',
        'Fresh buttered popcorn - Extra Large',
        10.50,
        TRUE
    ),
    -- Drinks
    (
        'Small Soft Drink',
        'drink',
        'Coca-Cola, Sprite, Fanta - Small',
        3.50,
        TRUE
    ),
    (
        'Medium Soft Drink',
        'drink',
        'Coca-Cola, Sprite, Fanta - Medium',
        4.50,
        TRUE
    ),
    (
        'Large Soft Drink',
        'drink',
        'Coca-Cola, Sprite, Fanta - Large',
        5.50,
        TRUE
    ),
    (
        'Bottled Water',
        'drink',
        'Premium bottled water',
        2.50,
        TRUE
    ),
    (
        'Energy Drink',
        'drink',
        'Red Bull or Monster',
        4.00,
        TRUE
    ),
    -- Combos
    (
        'Classic Combo',
        'combo',
        'Medium Popcorn + Medium Drink',
        9.99,
        TRUE
    ),
    (
        'Premium Combo',
        'combo',
        'Large Popcorn + Large Drink + Candy',
        13.99,
        TRUE
    ),
    (
        'Family Combo',
        'combo',
        '2 Large Popcorns + 4 Medium Drinks',
        24.99,
        TRUE
    ),
    (
        'Date Night Combo',
        'combo',
        'Large Popcorn + 2 Medium Drinks + 2 Candies',
        16.99,
        TRUE
    ),
    -- Snacks
    (
        'Nachos with Cheese',
        'snack',
        'Tortilla chips with warm cheese sauce',
        5.50,
        TRUE
    ),
    (
        'Hot Dog',
        'snack',
        'All-beef hot dog with condiments',
        4.50,
        TRUE
    ),
    (
        'Pretzel Bites',
        'snack',
        'Soft pretzel bites with cheese dip',
        5.00,
        TRUE
    ),
    -- Candy
    ('M&Ms', 'candy', 'Chocolate candy', 3.50, TRUE),
    (
        'Skittles',
        'candy',
        'Fruit flavored candy',
        3.50,
        TRUE
    ),
    (
        'Twizzlers',
        'candy',
        'Strawberry licorice',
        3.50,
        TRUE
    ),
    (
        'Sour Patch Kids',
        'candy',
        'Sour then sweet candy',
        3.50,
        TRUE
    );

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
-- PROCEDURE: GET USER BIRTHDAY PROMO
-- ========================================
DELIMITER $$ 
CREATE PROCEDURE get_user_birthday_promo(IN p_user_id INT) BEGIN
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
END $$ 
DELIMITER ;

-- ========================================
-- PROCEDURE: CHECK IF USER HAS BIRTHDAY TODAY
-- ========================================
DELIMITER $$ 
CREATE PROCEDURE check_user_birthday(IN p_user_id INT, OUT is_birthday BOOLEAN) 
BEGIN
    SELECT DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d') INTO is_birthday
    FROM users
    WHERE user_id = p_user_id;
END $$ 
DELIMITER ;

-- ========================================
-- PROCEDURE: APPLY BIRTHDAY DISCOUNT TO TICKET
-- ========================================
DELIMITER $$ 
CREATE PROCEDURE apply_birthday_discount(
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
    IF has_birthday AND promo_discount_value IS NOT NULL THEN 
        IF promo_discount_type = 'percentage' THEN
            SET p_discount_amount = p_ticket_price * (promo_discount_value / 100);
        ELSE
            SET p_discount_amount = promo_discount_value;
        END IF;
        SET p_discounted_price = p_ticket_price - p_discount_amount;
    ELSE
        SET p_discount_amount = 0;
        SET p_discounted_price = p_ticket_price;
    END IF;
END $$ 
DELIMITER ;

-- ========================================
-- TRIGGER: AUTO-CREATE BIRTHDAY PROMO DAILY
-- ========================================
DELIMITER $$ 
CREATE TRIGGER create_daily_birthday_promotion BEFORE
INSERT ON promotions FOR EACH ROW BEGIN IF NEW.promotion_type = 'birthday' THEN
    SET NEW.start_date = CURDATE();
    SET NEW.end_date = CURDATE();
END IF;
END $$ 
DELIMITER ;

-- ========================================
-- SCHEMA CREATION COMPLETE
-- ========================================
SELECT 'All tables created successfully!' as Status;