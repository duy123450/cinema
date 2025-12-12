<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $banners = [];
        
        // Get featured movies (now showing and upcoming)
        $movies_query = "SELECT m.movie_id, m.title, m.description, m.release_date,
                                m.rating, m.poster_url, m.status, m.genre,
                                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as cast_list
                         FROM movies m
                         LEFT JOIN movie_cast mc ON m.movie_id = mc.movie_id
                         LEFT JOIN actors a ON mc.actor_id = a.actor_id
                         WHERE m.status IN ('now_showing', 'upcoming')
                         GROUP BY m.movie_id
                         ORDER BY m.release_date DESC
                         LIMIT 3";
        
        $movies_stmt = $conn->prepare($movies_query);
        $movies_stmt->execute();
        $movies = $movies_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get active promotions
        $promos_query = "SELECT promotion_id, title, description, discount_type,
                                discount_value, code, start_date, end_date, promotion_type
                         FROM promotions
                         WHERE status = 'active'
                         AND CURDATE() BETWEEN start_date AND end_date
                         ORDER BY RAND()
                         LIMIT 2";
        
        $promos_stmt = $conn->prepare($promos_query);
        $promos_stmt->execute();
        $promotions = $promos_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format movies for banner
        foreach ($movies as $movie) {
            $status_text = match($movie['status']) {
                'now_showing' => 'NOW SHOWING',
                'upcoming' => 'COMING SOON',
                default => strtoupper($movie['status'])
            };
            
            $release_text = $movie['status'] === 'upcoming' 
                ? 'IN THEATERS ' . strtoupper(date('F j, Y', strtotime($movie['release_date'])))
                : 'IN THEATERS NOW';
            
            // Get cast as array (limit to 5)
            $cast = $movie['cast_list'] ? array_slice(explode(', ', $movie['cast_list']), 0, 5) : [];
            
            // Use cinematic background images instead of poster
            $background_images = [
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=2000&q=80',
                'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=2000&q=80',
                'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=2000&q=80',
                'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=2000&q=80',
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=2000&q=80'
            ];
            
            $banners[] = [
                'id' => $movie['movie_id'],
                'type' => 'movie',
                'title' => $movie['title'],
                'tagline' => strtoupper($movie['description'] ?: 'AN EPIC CINEMATIC EXPERIENCE'),
                'cast' => $cast,
                'showtimes' => $status_text,
                'release' => $release_text,
                'rating' => "Rated {$movie['rating']} • " . ($movie['genre'] ?: 'Action • Adventure'),
                'image' => $background_images[array_rand($background_images)],
                'buttonLabel' => $movie['status'] === 'now_showing' ? 'Book Tickets' : 'View Details',
                'buttonLink' => "/movies/{$movie['movie_id']}"
            ];
        }
        
        // Format promotions for banner
        foreach ($promotions as $promo) {
            $discount_display = $promo['discount_type'] === 'percentage' 
                ? "{$promo['discount_value']}% OFF"
                : "\${$promo['discount_value']} OFF";
            
            $promo_type_display = match($promo['promotion_type']) {
                'birthday' => '🎂 BIRTHDAY SPECIAL',
                'seasonal' => '🎉 SEASONAL OFFER',
                'loyalty' => '⭐ LOYALTY REWARD',
                default => '🎟️ SPECIAL OFFER'
            };
            
            $banners[] = [
                'id' => "promo_{$promo['promotion_id']}",
                'type' => 'promotion',
                'title' => $promo['title'],
                'tagline' => strtoupper($promo['description']),
                'cast' => [$discount_display, "Code: {$promo['code']}", $promo_type_display],
                'showtimes' => 'VALID UNTIL ' . strtoupper(date('F j, Y', strtotime($promo['end_date']))),
                'release' => 'BOOK NOW AND SAVE!',
                'rating' => 'Limited Time Offer • All Movies',
                'image' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=2000&q=80',
                'buttonLabel' => 'Get Discount',
                'buttonLink' => '/movies'
            ];
        }
        
        // Shuffle to mix movies and promotions
        shuffle($banners);
        
        http_response_code(200);
        echo json_encode($banners);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching banner data: ' . $e->getMessage()
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