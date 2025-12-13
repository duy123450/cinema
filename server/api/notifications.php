<?php
require_once '../cors.php';
require_once '../auth/check-auth.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$auth_user = checkAuth();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $user_id = $auth_user['user_id'];
        $notifications = [];

        // 1. Get NEW MOVIES (released in the last 7 days or upcoming in next 7 days)
        $movies_query = "SELECT movie_id, title, poster_url, release_date, status, created_at
                         FROM movies
                         WHERE (status = 'now_showing' AND release_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))
                            OR (status = 'upcoming' AND release_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY))
                         ORDER BY created_at DESC
                         LIMIT 5";
        
        $movies_stmt = $conn->prepare($movies_query);
        $movies_stmt->execute();
        $new_movies = $movies_stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($new_movies as $movie) {
            $time_ago = getTimeAgo($movie['created_at']);
            $status_text = $movie['status'] === 'now_showing' ? 'Now Showing' : 'Coming Soon';
            
            $notifications[] = [
                'id' => 'movie_' . $movie['movie_id'],
                'type' => 'movie',
                'title' => 'New Movie: ' . $movie['title'],
                'message' => $status_text . ' - Book your tickets now!',
                'time' => $time_ago,
                'timestamp' => $movie['created_at'],
                'link' => '/movies/' . $movie['movie_id'],
                'image' => $movie['poster_url'],
                'is_read' => false
            ];
        }

        // 2. Get ACTIVE PROMOTIONS
        $promos_query = "SELECT promotion_id, title, description, discount_type, 
                                discount_value, code, start_date, end_date, promotion_type, created_at
                         FROM promotions
                         WHERE status = 'active'
                         AND CURDATE() BETWEEN start_date AND end_date
                         ORDER BY created_at DESC
                         LIMIT 5";
        
        $promos_stmt = $conn->prepare($promos_query);
        $promos_stmt->execute();
        $promotions = $promos_stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($promotions as $promo) {
            $time_ago = getTimeAgo($promo['created_at']);
            $discount_display = $promo['discount_type'] === 'percentage' 
                ? $promo['discount_value'] . '% OFF'
                : '$' . $promo['discount_value'] . ' OFF';
            
            $promo_icon = match($promo['promotion_type']) {
                'birthday' => '🎂',
                'seasonal' => '🎉',
                'loyalty' => '⭐',
                default => '🎁'
            };
            
            $notifications[] = [
                'id' => 'promo_' . $promo['promotion_id'],
                'type' => 'promotion',
                'title' => $promo_icon . ' ' . $promo['title'],
                'message' => $discount_display . ' - Use code: ' . $promo['code'],
                'time' => $time_ago,
                'timestamp' => $promo['created_at'],
                'link' => '/movies',
                'image' => null,
                'is_read' => false
            ];
        }

        // 3. Get USER'S RECENT BOOKINGS (last 7 days)
        $bookings_query = "SELECT t.ticket_id, t.seat_number, t.status, t.created_at,
                                  m.title, m.poster_url,
                                  s.show_date, s.show_time,
                                  c.name as cinema_name
                           FROM tickets t
                           JOIN showtimes s ON t.showtime_id = s.showtime_id
                           JOIN movies m ON s.movie_id = m.movie_id
                           JOIN screens sc ON s.screen_id = sc.screen_id
                           JOIN cinemas c ON sc.cinema_id = c.cinema_id
                           WHERE t.user_id = ?
                           AND t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                           ORDER BY t.created_at DESC
                           LIMIT 5";
        
        $bookings_stmt = $conn->prepare($bookings_query);
        $bookings_stmt->execute([$user_id]);
        $bookings = $bookings_stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($bookings as $booking) {
            $time_ago = getTimeAgo($booking['created_at']);
            $status_icon = match($booking['status']) {
                'paid' => '✅',
                'booked' => '🎟️',
                'cancelled' => '❌',
                default => '🎫'
            };
            
            $status_text = match($booking['status']) {
                'paid' => 'Confirmed',
                'booked' => 'Reserved',
                'cancelled' => 'Cancelled',
                default => ucfirst($booking['status'])
            };
            
            $show_date = date('M j, Y', strtotime($booking['show_date']));
            $show_time = date('g:i A', strtotime($booking['show_time']));
            
            $notifications[] = [
                'id' => 'ticket_' . $booking['ticket_id'],
                'type' => 'booking',
                'title' => $status_icon . ' Ticket ' . $status_text . ': ' . $booking['title'],
                'message' => 'Seat ' . $booking['seat_number'] . ' - ' . $show_date . ' at ' . $show_time,
                'time' => $time_ago,
                'timestamp' => $booking['created_at'],
                'link' => '/bookings',
                'image' => $booking['poster_url'],
                'is_read' => false
            ];
        }

        // 4. Check for UPCOMING SHOWTIMES (user's booked tickets for shows in next 24 hours)
        $upcoming_query = "SELECT t.ticket_id, t.seat_number,
                                  m.title, m.poster_url,
                                  s.show_date, s.show_time,
                                  c.name as cinema_name,
                                  sc.screen_number
                           FROM tickets t
                           JOIN showtimes s ON t.showtime_id = s.showtime_id
                           JOIN movies m ON s.movie_id = m.movie_id
                           JOIN screens sc ON s.screen_id = sc.screen_id
                           JOIN cinemas c ON sc.cinema_id = c.cinema_id
                           WHERE t.user_id = ?
                           AND t.status IN ('paid', 'booked')
                           AND CONCAT(s.show_date, ' ', s.show_time) BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
                           ORDER BY s.show_date ASC, s.show_time ASC";
        
        $upcoming_stmt = $conn->prepare($upcoming_query);
        $upcoming_stmt->execute([$user_id]);
        $upcoming_shows = $upcoming_stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($upcoming_shows as $show) {
            $show_datetime = strtotime($show['show_date'] . ' ' . $show['show_time']);
            $hours_until = round(($show_datetime - time()) / 3600, 1);
            
            $notifications[] = [
                'id' => 'upcoming_' . $show['ticket_id'],
                'type' => 'reminder',
                'title' => '⏰ Show Reminder: ' . $show['title'],
                'message' => 'Starting in ' . $hours_until . ' hours at ' . $show['cinema_name'] . ' (Screen ' . $show['screen_number'] . ')',
                'time' => 'In ' . $hours_until . ' hours',
                'timestamp' => date('Y-m-d H:i:s', $show_datetime),
                'link' => '/bookings',
                'image' => $show['poster_url'],
                'is_read' => false
            ];
        }

        // 5. Check for BIRTHDAY PROMOTION
        $birthday_query = "SELECT u.user_id, u.date_of_birth,
                                  p.promotion_id, p.title, p.description, p.code, p.discount_value, p.discount_type
                           FROM users u
                           CROSS JOIN promotions p
                           WHERE u.user_id = ?
                           AND DATE_FORMAT(u.date_of_birth, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
                           AND p.promotion_type = 'birthday'
                           AND p.status = 'active'
                           AND CURDATE() BETWEEN p.start_date AND p.end_date
                           LIMIT 1";
        
        $birthday_stmt = $conn->prepare($birthday_query);
        $birthday_stmt->execute([$user_id]);
        $birthday_promo = $birthday_stmt->fetch(PDO::FETCH_ASSOC);

        if ($birthday_promo) {
            $discount_display = $birthday_promo['discount_type'] === 'percentage' 
                ? $birthday_promo['discount_value'] . '% OFF'
                : '$' . $birthday_promo['discount_value'] . ' OFF';
            
            $notifications[] = [
                'id' => 'birthday_' . $birthday_promo['promotion_id'],
                'type' => 'birthday',
                'title' => '🎂 Happy Birthday!',
                'message' => 'Enjoy ' . $discount_display . ' on your special day! Code: ' . $birthday_promo['code'],
                'time' => 'Today',
                'timestamp' => date('Y-m-d H:i:s'),
                'link' => '/movies',
                'image' => null,
                'is_read' => false
            ];
        }

        // Sort all notifications by timestamp (newest first)
        usort($notifications, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        // Limit to 10 most recent notifications
        $notifications = array_slice($notifications, 0, 10);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'count' => count($notifications),
            'notifications' => $notifications
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching notifications: ' . $e->getMessage()
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

// Helper function to calculate time ago
function getTimeAgo($timestamp) {
    $time_ago = strtotime($timestamp);
    $current_time = time();
    $time_difference = $current_time - $time_ago;
    
    $seconds = $time_difference;
    $minutes = round($seconds / 60);
    $hours = round($seconds / 3600);
    $days = round($seconds / 86400);
    $weeks = round($seconds / 604800);
    $months = round($seconds / 2629440);
    $years = round($seconds / 31553280);
    
    if ($seconds <= 60) {
        return "Just now";
    } else if ($minutes <= 60) {
        return $minutes == 1 ? "1 min ago" : "$minutes mins ago";
    } else if ($hours <= 24) {
        return $hours == 1 ? "1 hour ago" : "$hours hours ago";
    } else if ($days <= 7) {
        return $days == 1 ? "1 day ago" : "$days days ago";
    } else if ($weeks <= 4.3) {
        return $weeks == 1 ? "1 week ago" : "$weeks weeks ago";
    } else if ($months <= 12) {
        return $months == 1 ? "1 month ago" : "$months months ago";
    } else {
        return $years == 1 ? "1 year ago" : "$years years ago";
    }
}