<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Method not allowed']));
}

try {
    $default = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=2000&q=80';
    $banners = [];

    $movies = $conn->query("SELECT m.* , GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') cast_list
        FROM movies m LEFT JOIN movie_cast mc ON m.movie_id=mc.movie_id 
        LEFT JOIN actors a ON mc.actor_id=a.actor_id 
        WHERE m.status IN ('now_showing','upcoming') GROUP BY m.movie_id 
        ORDER BY m.release_date DESC LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);

    $promos = $conn->query("SELECT * FROM promotions WHERE status='active' 
        AND CURDATE() BETWEEN start_date AND end_date ORDER BY RAND() LIMIT 2")->fetchAll(PDO::FETCH_ASSOC);

    foreach ($movies as $m) {
        $banners[] = [
            'id' => $m['movie_id'],
            'type' => 'movie',
            'title' => $m['title'],
            'tagline' => strtoupper($m['description'] ?: 'AN EPIC CINEMATIC EXPERIENCE'),
            'cast' => $m['cast_list'] ? array_slice(explode(', ', $m['cast_list']), 0, 5) : [],
            'showtimes' => $m['status'] === 'now_showing' ? 'NOW SHOWING' : 'COMING SOON',
            'release' => $m['status'] === 'upcoming' ? 'IN THEATERS ' . strtoupper(date('F j, Y', strtotime($m['release_date']))) : 'IN THEATERS NOW',
            'rating' => "Rated {$m['rating']} • " . ($m['genre'] ?: 'Action • Adventure'),
            'image' => $m['poster_url'] ?: $default,
            'buttonLabel' => $m['status'] === 'now_showing' ? 'Book Tickets' : 'View Details',
            'buttonLink' => "/movies/{$m['movie_id']}"
        ];
    }

    foreach ($promos as $p) {
        $type = match ($p['promotion_type']) {
            'birthday' => '🎂 BIRTHDAY SPECIAL',
            'seasonal' => '🎉 SEASONAL OFFER',
            'loyalty' => '⭐ LOYALTY REWARD',
            default => '🎟️ SPECIAL OFFER'
        };
        $banners[] = [
            'id' => "promo_{$p['promotion_id']}",
            'type' => 'promotion',
            'title' => $p['title'],
            'tagline' => strtoupper($p['description']),
            'cast' => [$p['discount_type'] === 'percentage' ? "{$p['discount_value']}% OFF" : "\${$p['discount_value']} OFF", "Code: {$p['code']}", $type],
            'showtimes' => 'VALID UNTIL ' . strtoupper(date('F j, Y', strtotime($p['end_date']))),
            'release' => 'BOOK NOW AND SAVE!',
            'rating' => 'Limited Time Offer • All Movies',
            'image' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=2000&q=80',
            'buttonLabel' => 'Get Discount',
            'buttonLink' => '/movies'
        ];
    }

    shuffle($banners);
    header('Content-Type: application/json');
    exit(json_encode($banners));
} catch (Exception $e) {
    http_response_code(500);
    exit(json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]));
}
?>
$conn = null;