<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

// GET user rating for a movie
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $movie_id = $_GET['movie_id'] ?? null;
        $user_id = $_GET['user_id'] ?? null;
        
        if (!$movie_id || !$user_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Movie ID and User ID are required'
            ]);
            exit();
        }
        
        $query = "SELECT rating FROM reviews 
                  WHERE movie_id = ? AND user_id = ?
                  LIMIT 1";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([$movie_id, $user_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'rating' => (int)$result['rating']
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'No rating found',
                'rating' => 0
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching rating: ' . $e->getMessage()
        ]);
    }
}

// POST/UPDATE user rating for a movie
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $movie_id = $input['movie_id'] ?? null;
        $user_id = $input['user_id'] ?? null;
        $rating = $input['rating'] ?? null;
        
        if (!$movie_id || !$user_id || !$rating) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Movie ID, User ID, and Rating are required'
            ]);
            exit();
        }
        
        // Verify user is rating for themselves
        if ($auth_user['user_id'] != $user_id) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden: Can only rate for yourself'
            ]);
            exit();
        }
        
        // Validate rating (1-10 for your system)
        if ($rating < 1 || $rating > 10) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Rating must be between 1 and 10'
            ]);
            exit();
        }
        
        // Check if rating already exists
        $check_query = "SELECT review_id FROM reviews WHERE movie_id = ? AND user_id = ?";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->execute([$movie_id, $user_id]);
        $existing = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            // Update existing rating
            $query = "UPDATE reviews SET rating = ?, updated_at = CURRENT_TIMESTAMP 
                      WHERE movie_id = ? AND user_id = ?";
            $stmt = $conn->prepare($query);
            $result = $stmt->execute([$rating, $movie_id, $user_id]);
        } else {
            // Insert new rating (convert 1-10 rating to 1-5 for database)
            $db_rating = ceil($rating / 2); // Convert 10-point to 5-point scale
            $query = "INSERT INTO reviews (movie_id, user_id, rating, comment, is_verified_purchase) 
                      VALUES (?, ?, ?, '', FALSE)";
            $stmt = $conn->prepare($query);
            $result = $stmt->execute([$movie_id, $user_id, $db_rating]);
        }
        
        if ($result) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Rating saved successfully',
                'rating' => $rating
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to save rating'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error saving rating: ' . $e->getMessage()
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