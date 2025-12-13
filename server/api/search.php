<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = $_GET['q'] ?? '';
        
        if (strlen($query) < 2) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Search query must be at least 2 characters'
            ]);
            exit();
        }
        
        // Search movies by title, original_title, director, genre, or cast
        $search_query = "SELECT DISTINCT m.movie_id, m.title, m.original_title, 
                                m.description, m.release_date, m.director, m.genre,
                                m.language, m.rating, m.imdb_rating, m.poster_url, m.status
                         FROM movies m
                         LEFT JOIN movie_cast mc ON m.movie_id = mc.movie_id
                         LEFT JOIN actors a ON mc.actor_id = a.actor_id
                         WHERE m.title LIKE ? 
                            OR m.original_title LIKE ?
                            OR m.director LIKE ?
                            OR m.genre LIKE ?
                            OR m.description LIKE ?
                            OR a.name LIKE ?
                         ORDER BY 
                            CASE 
                                WHEN m.title LIKE ? THEN 1
                                WHEN m.original_title LIKE ? THEN 2
                                WHEN m.director LIKE ? THEN 3
                                WHEN m.genre LIKE ? THEN 4
                                ELSE 5
                            END,
                            m.release_date DESC
                         LIMIT 10";
        
        $search_term = "%{$query}%";
        $exact_term = "{$query}%"; // For priority ranking
        
        $stmt = $conn->prepare($search_query);
        $stmt->execute([
            $search_term, // title
            $search_term, // original_title
            $search_term, // director
            $search_term, // genre
            $search_term, // description
            $search_term, // actor name
            $exact_term,  // title priority
            $exact_term,  // original_title priority
            $exact_term,  // director priority
            $exact_term   // genre priority
        ]);
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($results);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error performing search: ' . $e->getMessage()
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