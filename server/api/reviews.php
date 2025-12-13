<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

// GET reviews for a movie
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
        
        $query = "SELECT r.review_id, r.movie_id, r.user_id, r.rating, r.comment,
                         r.is_verified_purchase, r.created_at, r.updated_at,
                         u.username, u.avatar
                  FROM reviews r
                  JOIN users u ON r.user_id = u.user_id
                  WHERE r.movie_id = ?
                  ORDER BY r.created_at DESC";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([$movie_id]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($reviews);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching reviews: ' . $e->getMessage()
        ]);
    }
}

// POST/CREATE a new review
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $movie_id = $input['movie_id'] ?? null;
        $user_id = $input['user_id'] ?? null;
        $rating = $input['rating'] ?? null;
        $comment = $input['comment'] ?? '';
        
        if (!$movie_id || !$user_id || !$rating) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Movie ID, User ID, and Rating are required'
            ]);
            exit();
        }
        
        // Verify user is submitting review for themselves
        if ($auth_user['user_id'] != $user_id) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden: Can only submit reviews for yourself'
            ]);
            exit();
        }
        
        // Convert 10-point rating to 5-point scale for database
        $db_rating = ceil($rating / 2);
        
        // Validate rating (1-5 in database)
        if ($db_rating < 1 || $db_rating > 5) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Rating must be between 1 and 10'
            ]);
            exit();
        }
        
        // Check if user has booked a ticket for this movie (for verified purchase)
        $ticket_query = "SELECT COUNT(*) as ticket_count
                         FROM tickets t
                         JOIN showtimes s ON t.showtime_id = s.showtime_id
                         WHERE t.user_id = ? AND s.movie_id = ? AND t.status IN ('paid', 'booked')";
        $ticket_stmt = $conn->prepare($ticket_query);
        $ticket_stmt->execute([$user_id, $movie_id]);
        $ticket_result = $ticket_stmt->fetch(PDO::FETCH_ASSOC);
        $is_verified = $ticket_result['ticket_count'] > 0;
        
        // Check if review already exists
        $check_query = "SELECT review_id FROM reviews WHERE movie_id = ? AND user_id = ?";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->execute([$movie_id, $user_id]);
        $existing = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            // Update existing review
            $query = "UPDATE reviews 
                      SET rating = ?, comment = ?, is_verified_purchase = ?, updated_at = CURRENT_TIMESTAMP 
                      WHERE movie_id = ? AND user_id = ?";
            $stmt = $conn->prepare($query);
            $result = $stmt->execute([$db_rating, $comment, $is_verified, $movie_id, $user_id]);
            $message = 'Review updated successfully';
        } else {
            // Insert new review
            $query = "INSERT INTO reviews (movie_id, user_id, rating, comment, is_verified_purchase) 
                      VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($query);
            $result = $stmt->execute([$movie_id, $user_id, $db_rating, $comment, $is_verified]);
            $message = 'Review submitted successfully';
        }
        
        if ($result) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => $message
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to save review'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error saving review: ' . $e->getMessage()
        ]);
    }
}

// DELETE a review
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();
    
    try {
        $review_id = $_GET['id'] ?? null;
        
        if (!$review_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Review ID is required'
            ]);
            exit();
        }
        
        // Get review to verify ownership
        $check_query = "SELECT user_id FROM reviews WHERE review_id = ?";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->execute([$review_id]);
        $review = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$review) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Review not found'
            ]);
            exit();
        }
        
        // Only allow deletion by owner or admin
        if ($auth_user['user_id'] != $review['user_id'] && $auth_user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden: Can only delete your own reviews'
            ]);
            exit();
        }
        
        $query = "DELETE FROM reviews WHERE review_id = ?";
        $stmt = $conn->prepare($query);
        $result = $stmt->execute([$review_id]);
        
        if ($result) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete review'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting review: ' . $e->getMessage()
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