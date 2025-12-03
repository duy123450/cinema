-- ========================================
-- CINEMA MANAGEMENT - COMPLETE DATA DUMP
-- ========================================
-- Execute this script after creating the database tables

USE cinema_management;

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
) VALUES 
(
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
) VALUES
(
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
) VALUES
-- Downtown Cinema (cinema_id = 1)
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
INSERT INTO actors (name, bio, image_url) VALUES
('Rimuru Tempest', 'The protagonist reborn as a powerful Slime monster with incredible abilities', 'https://cdn.example.com/actors/rimuru.jpg'),
('Benimaru', 'A skilled demon warrior and loyal companion to Rimuru', 'https://cdn.example.com/actors/benimaru.jpg'),
('Shion', 'An intelligent demon maid devoted to Rimuru', 'https://cdn.example.com/actors/shion.jpg'),
('Hiiro', 'A powerful harpy with mastery of lightning magic', 'https://cdn.example.com/actors/hiiro.jpg'),
('Veldora', 'An ancient dragon with immense magical power', 'https://cdn.example.com/actors/veldora.jpg'),
('Timothée Chalamet', 'Lead actor known for intense dramatic roles', 'https://cdn.example.com/actors/timothee.jpg'),
('Zendaya', 'Talented actress and producer with global appeal', 'https://cdn.example.com/actors/zendaya.jpg'),
('Rebecca Ferguson', 'Award-winning actress known for diverse roles', 'https://cdn.example.com/actors/rebecca.jpg'),
('Austin Butler', 'Rising star actor with incredible range', 'https://cdn.example.com/actors/austin.jpg'),
('Miles Morales', 'Spider-Man from the animated multiverse', 'https://cdn.example.com/actors/miles.jpg'),
('Gwen Stacy', 'Spider-Gwen from an alternate universe', 'https://cdn.example.com/actors/gwen.jpg');

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
) VALUES
(
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
) VALUES
-- Tensura Movie 2 (movie_id = 1)
(1, 1, 'Rimuru Tempest', 'lead', 1),
(1, 2, 'Benimaru', 'supporting', 2),
(1, 3, 'Shion', 'supporting', 3),
(1, 4, 'Hiiro', 'supporting', 4),
(1, 5, 'Veldora', 'cameo', 5),
-- Spider-Verse (movie_id = 2)
(2, 10, 'Miles Morales / Spider-Man', 'lead', 1),
(2, 11, 'Gwen Stacy / Spider-Gwen', 'supporting', 2),
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
) VALUES
-- Tensura Movie 2 trailers
(1, 'Tensura Movie 2 - Official Trailer', 'https://youtube.com/watch?v=tensura2_official', 180, 'official', 'Japanese', TRUE, 2500000),
(1, 'Tensura Movie 2 - Teaser Trailer', 'https://youtube.com/watch?v=tensura2_teaser', 90, 'teaser', 'Japanese', FALSE, 850000),
(1, 'Tensura Movie 2 - Behind the Scenes', 'https://youtube.com/watch?v=tensura2_bts', 240, 'behind_the_scenes', 'Japanese', FALSE, 420000),
-- Spider-Verse trailers
(2, 'Spider-Verse - Official Trailer', 'https://youtube.com/watch?v=spiderverse_official', 240, 'official', 'English', TRUE, 3200000),
(2, 'Spider-Verse - Teaser', 'https://youtube.com/watch?v=spiderverse_teaser', 120, 'teaser', 'English', FALSE, 1100000),
-- Dune: Part Two trailers
(3, 'Dune Part 2 - Official Trailer', 'https://youtube.com/watch?v=dune2_official', 180, 'official', 'English', TRUE, 5600000),
(3, 'Dune Part 2 - Special Clip', 'https://youtube.com/watch?v=dune2_clip', 120, 'clip', 'English', FALSE, 920000),
(3, 'Dune Part 2 - Behind the Scenes', 'https://youtube.com/watch?v=dune2_bts', 300, 'behind_the_scenes', 'English', FALSE, 780000),
-- Sonic 4 trailers
(9, 'Sonic 4 - Official Trailer', 'https://youtube.com/watch?v=sonic4_official', 150, 'official', 'English', TRUE, 4100000),
(9, 'Sonic 4 - Teaser', 'https://youtube.com/watch?v=sonic4_teaser', 90, 'teaser', 'English', FALSE, 1200000);

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
) VALUES
-- Tensura Movie 2 at Downtown Cinema
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
) VALUES
(1, 2, 'A1', 'adult', 12.99, 'paid'),
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
) VALUES
(1, 2, 12.99, 'credit_card', 'completed', 'TRX_20251203_001'),
(2, 2, 12.99, 'credit_card', 'completed', 'TRX_20251203_002'),
(3, 3, 9.99, 'debit_card', 'completed', 'TRX_20251203_003'),
(4, 4, 12.99, 'credit_card', 'completed', 'TRX_20251203_004'),
(5, 5, 12.99, 'paypal', 'completed', 'TRX_20251204_001'),
(6, 6, 12.99, 'credit_card', 'completed', 'TRX_20251204_002'),
(7, 7, 8.99, 'cash', 'completed', 'TRX_20251204_003'),
(8, 2, 12.99, 'mobile', 'completed', 'TRX_20251204_004'),
(9, 3, 9.99, 'credit_card', 'completed', 'TRX_20251204_005'),
(10, 4, 12.99, 'credit_card', 'failed', 'TRX_20251204_006');

-- ========================================
-- REVIEWS DATA
-- ========================================
INSERT INTO reviews (
    movie_id,
    user_id,
    rating,
    comment,
    is_verified_purchase
) VALUES
(1, 2, 5, 'Amazing animation and storytelling! Absolutely loved it!', TRUE),
(2, 3, 4, 'Great action sequences and a solid plot. Highly recommended!', TRUE),
(3, 4, 5, 'Visually stunning! One of the best sci-fi movies ever made.', TRUE),
(4, 5, 4, 'Good effects and star power, but slightly predictable ending.', FALSE),
(5, 6, 5, 'Perfect family entertainment! Elsa and Anna are amazing as always.', TRUE),
(6, 7, 4, 'Excellent action and dark atmosphere. Batman at his finest!', TRUE),
(9, 2, 5, 'Sonic is faster and funnier than ever! A must-watch for fans.', FALSE),
(1, 3, 4, 'Very enjoyable. Great voice acting and character development.', TRUE),
(2, 4, 5, 'Mind-blowing animation! This is the future of cinema.', TRUE),
(3, 5, 4, 'Epic scale and incredible visuals. Slightly long but worth it.', TRUE);

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
) VALUES
(
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
INSERT INTO bookmarks (user_id, movie_id) VALUES
(2, 1),
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
-- DATA INSERTION COMPLETE
-- ========================================
SELECT 'All data inserted successfully!' as Status;
