<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $actor_id = $_GET['id'] ?? null;
        
        if ($actor_id) {
            // Get single actor
            $query = "SELECT actor_id, name, bio, image_url, created_at
                      FROM actors
                      WHERE actor_id = ?";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([$actor_id]);
            $actor = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$actor) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Actor not found'
                ]);
                exit();
            }
            
            http_response_code(200);
            echo json_encode($actor);
        } else {
            // Get all actors
            $query = "SELECT actor_id, name, bio, image_url, created_at
                      FROM actors
                      ORDER BY name ASC";
            
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $actors = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode($actors);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching actor: ' . $e->getMessage()
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