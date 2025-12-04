<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get showtimes with movie and cinema details
        $movie_id = $_GET['movie_id'] ?? null;
        $cinema_id = $_GET['cinema_id'] ?? null;
        $date = $_GET['date'] ?? null;

        $query = "SELECT s.*, 
                         m.title, m.duration_minutes, m.rating, m.poster_url,
                         c.name as cinema_name, c.address, c.city,
                         sc.screen_number, sc.screen_type
                  FROM showtimes s
                  JOIN movies m ON s.movie_id = m.movie_id
                  JOIN screens sc ON s.screen_id = sc.screen_id
                  JOIN cinemas c ON sc.cinema_id = c.cinema_id
                  WHERE 1=1";

        $params = [];

        if ($movie_id) {
            $query .= " AND s.movie_id = ?";
            $params[] = $movie_id;
        }

        if ($cinema_id) {
            $query .= " AND c.cinema_id = ?";
            $params[] = $cinema_id;
        }

        if ($date) {
            $query .= " AND s.show_date = ?";
            $params[] = $date;
        }

        $query .= " ORDER BY s.show_date ASC, s.show_time ASC";

        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $showtimes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($showtimes);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching showtimes: ' . $e->getMessage()
        ]);
    }
}

// CREATE showtime (ADMIN only)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();

    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden: Only admins can create showtimes'
        ]);
        exit();
    }

    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset(
            $input['movie_id'],
            $input['screen_id'],
            $input['show_date'],
            $input['show_time'],
            $input['price']
        )) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Required fields: movie_id, screen_id, show_date, show_time, price'
            ]);
            exit();
        }

        // Get screen capacity to set available_seats
        $screen_query = "SELECT total_seats FROM screens WHERE screen_id = ?";
        $screen_stmt = $conn->prepare($screen_query);
        $screen_stmt->execute([$input['screen_id']]);
        $screen = $screen_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$screen) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Screen not found'
            ]);
            exit();
        }

        $query = "INSERT INTO showtimes (movie_id, screen_id, show_date, show_time, price, available_seats)
                  VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($query);
        $result = $stmt->execute([
            $input['movie_id'],
            $input['screen_id'],
            $input['show_date'],
            $input['show_time'],
            $input['price'],
            $screen['total_seats']
        ]);

        if ($result) {
            $showtime_id = $conn->lastInsertId();
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Showtime created successfully',
                'showtime_id' => $showtime_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create showtime'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error creating showtime: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

$conn = null;
