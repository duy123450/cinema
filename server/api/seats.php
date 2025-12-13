<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $showtime_id = $_GET['showtime_id'] ?? null;
        
        if (!$showtime_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Showtime ID is required'
            ]);
            exit();
        }
        
        // Get the screen_id for this showtime
        $showtime_query = "SELECT screen_id FROM showtimes WHERE showtime_id = ?";
        $showtime_stmt = $conn->prepare($showtime_query);
        $showtime_stmt->execute([$showtime_id]);
        $showtime = $showtime_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$showtime) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Showtime not found'
            ]);
            exit();
        }
        
        // Get all seats for this screen
        $seats_query = "SELECT seat_id, screen_id, seat_row, seat_number, seat_label, status
                        FROM seats
                        WHERE screen_id = ?
                        ORDER BY seat_row ASC, seat_number ASC";
        
        $seats_stmt = $conn->prepare($seats_query);
        $seats_stmt->execute([$showtime['screen_id']]);
        $seats = $seats_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get booked seats for this showtime
        $booked_query = "SELECT seat_number
                         FROM tickets
                         WHERE showtime_id = ?
                         AND status IN ('booked', 'paid')";
        
        $booked_stmt = $conn->prepare($booked_query);
        $booked_stmt->execute([$showtime_id]);
        $booked_seats = $booked_stmt->fetchAll(PDO::FETCH_COLUMN);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'seats' => $seats,
            'bookedSeats' => $booked_seats
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching seats: ' . $e->getMessage()
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