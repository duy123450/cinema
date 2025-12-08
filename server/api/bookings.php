<?php
require_once '../cors.php';
require_once '../auth/check-auth.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$auth_user = checkAuth();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $user_id = $_GET['user_id'] ?? $auth_user['user_id'];

        // Users can only see their own bookings unless they're admin
        if (isset($auth_user['role']) && $auth_user['role'] !== 'admin' && $auth_user['user_id'] != $user_id) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden: Can only view your own bookings'
            ]);
            exit();
        }

        // Get bookings with movie and showtime details
        $query = "SELECT t.ticket_id, t.showtime_id, t.user_id, t.seat_number, t.ticket_type,
                         t.price_paid, t.status, t.created_at,
                         m.movie_id, m.title as movie_title, m.rating, m.poster_url,
                         s.show_date, s.show_time, s.price,
                         sc.screen_number, sc.screen_type,
                         c.name as cinema_name, c.address, c.city
                  FROM tickets t
                  JOIN showtimes s ON t.showtime_id = s.showtime_id
                  JOIN movies m ON s.movie_id = m.movie_id
                  JOIN screens sc ON s.screen_id = sc.screen_id
                  JOIN cinemas c ON sc.cinema_id = c.cinema_id
                  WHERE t.user_id = ?
                  ORDER BY s.show_date DESC, s.show_time DESC";

        $stmt = $conn->prepare($query);
        $stmt->execute([$user_id]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($bookings);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching bookings: ' . $e->getMessage()
        ]);
    }
}

// CREATE booking (POST)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['showtime_id'], $input['seat_number'], $input['ticket_type'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Required fields: showtime_id, seat_number, ticket_type'
            ]);
            exit();
        }

        // Get showtime details
        $showtime_query = "SELECT price FROM showtimes WHERE showtime_id = ?";
        $showtime_stmt = $conn->prepare($showtime_query);
        $showtime_stmt->execute([$input['showtime_id']]);
        $showtime = $showtime_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$showtime) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Showtime not found'
            ]);
            exit();
        }

        // Check if seat is already booked
        $seat_query = "SELECT ticket_id FROM tickets 
                       WHERE showtime_id = ? AND seat_number = ? AND status IN ('booked', 'paid')";
        $seat_stmt = $conn->prepare($seat_query);
        $seat_stmt->execute([$input['showtime_id'], $input['seat_number']]);

        if ($seat_stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Seat already booked'
            ]);
            exit();
        }

        // Create ticket
        $query = "INSERT INTO tickets (showtime_id, user_id, seat_number, ticket_type, price_paid, status)
                  VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($query);
        $result = $stmt->execute([
            $input['showtime_id'],
            $auth_user['user_id'],
            $input['seat_number'],
            $input['ticket_type'],
            $showtime['price'],
            'booked'
        ]);

        if ($result) {
            $ticket_id = $conn->lastInsertId();

            // Decrease available seats
            $update_query = "UPDATE showtimes SET available_seats = available_seats - 1 
                            WHERE showtime_id = ?";
            $update_stmt = $conn->prepare($update_query);
            $update_stmt->execute([$input['showtime_id']]);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Booking created successfully',
                'ticket_id' => $ticket_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create booking'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error creating booking: ' . $e->getMessage()
        ]);
    }
}

// CANCEL booking (DELETE)
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $ticket_id = $_GET['id'] ?? null;

        if (!$ticket_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Ticket ID is required'
            ]);
            exit();
        }

        // Get ticket details
        $ticket_query = "SELECT user_id, showtime_id, status FROM tickets WHERE ticket_id = ?";
        $ticket_stmt = $conn->prepare($ticket_query);
        $ticket_stmt->execute([$ticket_id]);
        $ticket = $ticket_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Ticket not found'
            ]);
            exit();
        }

        // Users can only cancel their own bookings unless they're admin
        if (isset($auth_user['role']) && $auth_user['role'] !== 'admin' && $auth_user['user_id'] != $ticket['user_id']) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden: Can only cancel your own bookings'
            ]);
            exit();
        }

        // Cancel ticket
        $query = "UPDATE tickets SET status = 'cancelled' WHERE ticket_id = ?";
        $stmt = $conn->prepare($query);
        $result = $stmt->execute([$ticket_id]);

        if ($result) {
            // Increase available seats
            $update_query = "UPDATE showtimes SET available_seats = available_seats + 1 
                            WHERE showtime_id = ?";
            $update_stmt = $conn->prepare($update_query);
            $update_stmt->execute([$ticket['showtime_id']]);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Booking cancelled successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to cancel booking'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error cancelling booking: ' . $e->getMessage()
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