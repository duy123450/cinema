<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get all cinemas or filter by city
        $city = $_GET['city'] ?? null;
        $cinema_id = $_GET['id'] ?? null;

        if ($cinema_id) {
            // Get single cinema with screens
            $query = "SELECT c.*, 
                             COUNT(DISTINCT s.screen_id) as screen_count,
                             GROUP_CONCAT(DISTINCT s.screen_type) as screen_types
                      FROM cinemas c
                      LEFT JOIN screens s ON c.cinema_id = s.cinema_id
                      WHERE c.cinema_id = ?
                      GROUP BY c.cinema_id";

            $stmt = $conn->prepare($query);
            $stmt->execute([$cinema_id]);
            $cinema = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$cinema) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Cinema not found'
                ]);
                exit();
            }

            // Also get screens for this cinema
            $screens_query = "SELECT * FROM screens WHERE cinema_id = ? ORDER BY screen_number ASC";
            $screens_stmt = $conn->prepare($screens_query);
            $screens_stmt->execute([$cinema_id]);
            $cinema['screens'] = $screens_stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode($cinema);
        } else {
            // Get all cinemas
            $query = "SELECT c.*, 
                             COUNT(DISTINCT s.screen_id) as screen_count
                      FROM cinemas c
                      LEFT JOIN screens s ON c.cinema_id = s.cinema_id
                      WHERE c.status = 'open'";

            $params = [];

            if ($city) {
                $query .= " AND c.city = ?";
                $params[] = $city;
            }

            $query .= " GROUP BY c.cinema_id ORDER BY c.name ASC";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $cinemas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode($cinemas);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching cinemas: ' . $e->getMessage()
        ]);
    }
}

// CREATE cinema (ADMIN only)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();

    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden: Only admins can create cinemas'
        ]);
        exit();
    }

    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset(
            $input['name'],
            $input['address'],
            $input['city'],
            $input['country'],
            $input['total_screens'],
            $input['total_seats']
        )) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Required fields missing'
            ]);
            exit();
        }

        $query = "INSERT INTO cinemas (name, address, city, state, country, postal_code, 
                                      phone, email, total_screens, total_seats, amenities, 
                                      latitude, longitude, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($query);
        $result = $stmt->execute([
            $input['name'],
            $input['address'],
            $input['city'],
            $input['state'] ?? null,
            $input['country'],
            $input['postal_code'] ?? null,
            $input['phone'] ?? null,
            $input['email'] ?? null,
            $input['total_screens'],
            $input['total_seats'],
            $input['amenities'] ?? null,
            $input['latitude'] ?? null,
            $input['longitude'] ?? null,
            $input['status'] ?? 'open'
        ]);

        if ($result) {
            $cinema_id = $conn->lastInsertId();
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Cinema created successfully',
                'cinema_id' => $cinema_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create cinema'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error creating cinema: ' . $e->getMessage()
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
