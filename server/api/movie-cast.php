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
        
        $query = "SELECT mc.cast_id, mc.movie_id, mc.actor_id, mc.character_name, 
                         mc.role_type, mc.cast_order,
                         a.name, a.bio, a.image_url
                  FROM movie_cast mc
                  JOIN actors a ON mc.actor_id = a.actor_id
                  WHERE mc.movie_id = ?
                  ORDER BY mc.cast_order ASC, mc.role_type ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([$movie_id]);
        $cast = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($cast);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching cast: ' . $e->getMessage()
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