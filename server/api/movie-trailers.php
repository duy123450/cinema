<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $movie_id = $_GET['movie_id'] ?? null;
        
        if (!$movie_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Movie ID is required'
            ]);
            exit();
        }
        
        $query = "SELECT trailer_id, movie_id, title, url, duration_seconds, 
                         trailer_type, language, is_featured, views, created_at
                  FROM movie_trailers
                  WHERE movie_id = ?
                  ORDER BY is_featured DESC, created_at DESC";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([$movie_id]);
        $trailers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($trailers);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching trailers: ' . $e->getMessage()
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