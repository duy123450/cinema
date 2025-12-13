<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // FIXED: Add support for getting a single showtime by ID
        $showtime_id = $_GET['id'] ?? null;

        if ($showtime_id) {
            // Get single showtime by ID with all details
            $query = "SELECT s.showtime_id, s.movie_id, s.screen_id, s.show_date, s.show_time,
                             s.price, s.available_seats, s.created_at, s.updated_at,
                             m.title, m.duration_minutes, m.rating, m.poster_url,
                             c.name as cinema_name, c.address, c.city,
                             sc.screen_number, sc.screen_type
                      FROM showtimes s
                      JOIN movies m ON s.movie_id = m.movie_id
                      JOIN screens sc ON s.screen_id = sc.screen_id
                      JOIN cinemas c ON sc.cinema_id = c.cinema_id
                      WHERE s.showtime_id = ?";

            $stmt = $conn->prepare($query);
            $stmt->execute([$showtime_id]);
            $showtime = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$showtime) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Showtime not found'
                ]);
                exit();
            }

            http_response_code(200);
            echo json_encode($showtime);
            exit();
        }

        // Get multiple showtimes with filters
        $movie_id = $_GET['movie_id'] ?? null;
        $cinema_id = $_GET['cinema_id'] ?? null;
        $date = $_GET['date'] ?? null;

        $query = "SELECT s.showtime_id, s.movie_id, s.screen_id, s.show_date, s.show_time,
                         s.price, s.available_seats,
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

        // Require core fields; allow screen resolution via cinema_id + screen_number
        if (!isset($input['movie_id'], $input['show_date'], $input['show_time'], $input['price'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Required fields: movie_id, show_date, show_time, price and screen_id OR (cinema_id + screen_number)'
            ]);
            exit();
        }

        // Resolve screen_id: prefer provided screen_id, otherwise try cinema_id + screen_number
        $screen_id = $input['screen_id'] ?? null;
        if (!$screen_id && isset($input['cinema_id']) && isset($input['screen_number'])) {
            $q = "SELECT sc.screen_id FROM screens sc WHERE sc.cinema_id = ? AND sc.screen_number = ? LIMIT 1";
            $s = $conn->prepare($q);
            $s->execute([$input['cinema_id'], $input['screen_number']]);
            $row = $s->fetch(PDO::FETCH_ASSOC);
            $screen_id = $row['screen_id'] ?? null;
        }

        if (!$screen_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Missing or invalid screen: provide screen_id or cinema_id + screen_number'
            ]);
            exit();
        }

        // Get screen capacity to set available_seats
        $screen_query = "SELECT total_seats FROM screens WHERE screen_id = ?";
        $screen_stmt = $conn->prepare($screen_query);
        $screen_stmt->execute([$screen_id]);
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
            $screen_id,
            $input['show_date'],
            $input['show_time'],
            $input['price'],
            $screen['total_seats']
        ]);

        if ($result) {
            $showtime_id = $conn->lastInsertId();

            // Fetch the full showtime with joins to return rich data to the client
            $fetchQ = "SELECT s.showtime_id, s.movie_id, s.screen_id, s.show_date, s.show_time,
                              s.price, s.available_seats, s.created_at, s.updated_at,
                              m.title, m.duration_minutes, m.rating, m.poster_url,
                              c.cinema_id, c.name as cinema_name, c.address, c.city,
                              sc.screen_number, sc.screen_type
                       FROM showtimes s
                       JOIN movies m ON s.movie_id = m.movie_id
                       JOIN screens sc ON s.screen_id = sc.screen_id
                       JOIN cinemas c ON sc.cinema_id = c.cinema_id
                       WHERE s.showtime_id = ? LIMIT 1";

            $fstmt = $conn->prepare($fetchQ);
            $fstmt->execute([$showtime_id]);
            $created = $fstmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Showtime created successfully',
                'showtime_id' => $showtime_id,
                'showtime' => $created
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
}
// UPDATE showtime (ADMIN only)
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();

    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden: Only admins can update showtimes'
        ]);
        exit();
    }

    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $showtime_id = $_GET['id'] ?? $input['showtime_id'] ?? null;

        if (!$showtime_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing showtime id']);
            exit();
        }

        // Resolve screen_id if provided via cinema_id + screen_number
        $screen_id = $input['screen_id'] ?? null;
        if (!$screen_id && isset($input['cinema_id']) && isset($input['screen_number'])) {
            $q = "SELECT sc.screen_id FROM screens sc WHERE sc.cinema_id = ? AND sc.screen_number = ? LIMIT 1";
            $s = $conn->prepare($q);
            $s->execute([$input['cinema_id'], $input['screen_number']]);
            $row = $s->fetch(PDO::FETCH_ASSOC);
            $screen_id = $row['screen_id'] ?? null;
        }

        $fields = [];
        $params = [];

        if (isset($input['movie_id'])) {
            $fields[] = 'movie_id = ?';
            $params[] = $input['movie_id'];
        }
        if ($screen_id) {
            $fields[] = 'screen_id = ?';
            $params[] = $screen_id;
        }
        if (isset($input['show_date'])) {
            $fields[] = 'show_date = ?';
            $params[] = $input['show_date'];
        }
        if (isset($input['show_time'])) {
            $fields[] = 'show_time = ?';
            $params[] = $input['show_time'];
        }
        if (isset($input['price'])) {
            $fields[] = 'price = ?';
            $params[] = $input['price'];
        }
        if (isset($input['available_seats'])) {
            $fields[] = 'available_seats = ?';
            $params[] = $input['available_seats'];
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit();
        }

        $params[] = $showtime_id;
        $query = "UPDATE showtimes SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE showtime_id = ?";
        $stmt = $conn->prepare($query);
        $result = $stmt->execute($params);

        if ($result) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Showtime updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update showtime']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating showtime: ' . $e->getMessage()]);
    }
}

// DELETE showtime (ADMIN only)
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();

    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden: Only admins can delete showtimes'
        ]);
        exit();
    }

    try {
        // id can come from query string
        $showtime_id = $_GET['id'] ?? null;
        if (!$showtime_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing showtime id']);
            exit();
        }

        $stmt = $conn->prepare("DELETE FROM showtimes WHERE showtime_id = ?");
        $res = $stmt->execute([$showtime_id]);

        if ($res) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Showtime deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete showtime']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting showtime: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

$conn = null;
