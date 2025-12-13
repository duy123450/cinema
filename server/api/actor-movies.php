<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $actor_id = $_GET['actor_id'] ?? null;
        
        if (!$actor_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Actor ID is required'
            ]);
            exit();
        }
        
        $query = "SELECT m.movie_id, m.title, m.original_title, m.description,
                         m.duration_minutes, m.release_date, m.director, m.genre,
                         m.language, m.rating, m.imdb_rating, m.poster_url, m.status,
                         mc.character_name, mc.role_type, mc.cast_order
                  FROM movie_cast mc
                  JOIN movies m ON mc.movie_id = m.movie_id
                  WHERE mc.actor_id = ?
                  ORDER BY m.release_date DESC, mc.cast_order ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([$actor_id]);
        $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($movies);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching actor movies: ' . $e->getMessage()
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