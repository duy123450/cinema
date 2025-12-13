<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get active promotions that are valid today
        $query = "SELECT promotion_id, title, description, discount_type, discount_value, 
                         code, start_date, end_date, promotion_type
                  FROM promotions
                  WHERE status = 'active'
                  AND CURDATE() BETWEEN start_date AND end_date
                  ORDER BY discount_value DESC";
        
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($promotions);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching promotions: ' . $e->getMessage()
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