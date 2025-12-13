<?php
require_once '../cors.php';
require_once '../auth/check-auth.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$auth_user = checkAuth();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

// Check if user is admin
if ($auth_user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Forbidden: Admin access required'
    ]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get total movies count
        $movies_query = "SELECT COUNT(*) as total FROM movies";
        $movies_stmt = $conn->prepare($movies_query);
        $movies_stmt->execute();
        $total_movies = $movies_stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get total users count
        $users_query = "SELECT COUNT(*) as total FROM users";
        $users_stmt = $conn->prepare($users_query);
        $users_stmt->execute();
        $total_users = $users_stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get total bookings count
        $bookings_query = "SELECT COUNT(*) as total FROM tickets";
        $bookings_stmt = $conn->prepare($bookings_query);
        $bookings_stmt->execute();
        $total_bookings = $bookings_stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get total revenue (sum of all paid tickets)
        $revenue_query = "SELECT SUM(price_paid) as total FROM tickets WHERE status IN ('paid', 'booked')";
        $revenue_stmt = $conn->prepare($revenue_query);
        $revenue_stmt->execute();
        $total_revenue = $revenue_stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        // Get active showtimes count (future showtimes)
        $showtimes_query = "SELECT COUNT(*) as total FROM showtimes 
                           WHERE CONCAT(show_date, ' ', show_time) >= NOW()";
        $showtimes_stmt = $conn->prepare($showtimes_query);
        $showtimes_stmt->execute();
        $active_showtimes = $showtimes_stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get active cinemas count
        $cinemas_query = "SELECT COUNT(*) as total FROM cinemas WHERE status = 'open'";
        $cinemas_stmt = $conn->prepare($cinemas_query);
        $cinemas_stmt->execute();
        $active_cinemas = $cinemas_stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get recent activity (last 10 bookings)
        $activity_query = "SELECT t.ticket_id, t.seat_number, t.status, t.created_at,
                                  m.title as movie_title, m.poster_url,
                                  u.username
                           FROM tickets t
                           JOIN showtimes s ON t.showtime_id = s.showtime_id
                           JOIN movies m ON s.movie_id = m.movie_id
                           JOIN users u ON t.user_id = u.user_id
                           ORDER BY t.created_at DESC
                           LIMIT 10";
        
        $activity_stmt = $conn->prepare($activity_query);
        $activity_stmt->execute();
        $recent_activity = $activity_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format activity with time ago
        $formatted_activity = array_map(function($item) {
            return [
                'icon' => '🎟️',
                'title' => "New booking for {$item['movie_title']} by {$item['username']}",
                'time' => getTimeAgo($item['created_at']),
                'timestamp' => $item['created_at']
            ];
        }, $recent_activity);

        // Get additional stats
        // Movies by status
        $movies_by_status_query = "SELECT status, COUNT(*) as count FROM movies GROUP BY status";
        $movies_by_status_stmt = $conn->prepare($movies_by_status_query);
        $movies_by_status_stmt->execute();
        $movies_by_status = $movies_by_status_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Users by role
        $users_by_role_query = "SELECT role, COUNT(*) as count FROM users GROUP BY role";
        $users_by_role_stmt = $conn->prepare($users_by_role_query);
        $users_by_role_stmt->execute();
        $users_by_role = $users_by_role_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Bookings by status
        $bookings_by_status_query = "SELECT status, COUNT(*) as count FROM tickets GROUP BY status";
        $bookings_by_status_stmt = $conn->prepare($bookings_by_status_query);
        $bookings_by_status_stmt->execute();
        $bookings_by_status = $bookings_by_status_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Top movies by bookings
        $top_movies_query = "SELECT m.title, COUNT(t.ticket_id) as booking_count
                             FROM movies m
                             JOIN showtimes s ON m.movie_id = s.movie_id
                             JOIN tickets t ON s.showtime_id = t.showtime_id
                             WHERE t.status IN ('paid', 'booked')
                             GROUP BY m.movie_id, m.title
                             ORDER BY booking_count DESC
                             LIMIT 5";
        
        $top_movies_stmt = $conn->prepare($top_movies_query);
        $top_movies_stmt->execute();
        $top_movies = $top_movies_stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'stats' => [
                'totalMovies' => (int)$total_movies,
                'totalUsers' => (int)$total_users,
                'totalBookings' => (int)$total_bookings,
                'totalRevenue' => (float)$total_revenue,
                'activeShowtimes' => (int)$active_showtimes,
                'activeCinemas' => (int)$active_cinemas
            ],
            'recentActivity' => $formatted_activity,
            'breakdown' => [
                'moviesByStatus' => $movies_by_status,
                'usersByRole' => $users_by_role,
                'bookingsByStatus' => $bookings_by_status,
                'topMovies' => $top_movies
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching admin statistics: ' . $e->getMessage()
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