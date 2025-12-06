<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Check if requesting a single movie by ID
        $movie_id = $_GET['id'] ?? null;
        
        if ($movie_id) {
            // GET single movie with cast and trailers
            $query = "SELECT m.*, 
                             GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as cast_list,
                             COUNT(DISTINCT mt.trailer_id) as trailer_count
                      FROM movies m
                      LEFT JOIN movie_cast mc ON m.movie_id = mc.movie_id
                      LEFT JOIN actors a ON mc.actor_id = a.actor_id
                      LEFT JOIN movie_trailers mt ON m.movie_id = mt.movie_id
                      WHERE m.movie_id = ?
                      GROUP BY m.movie_id";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([$movie_id]);
            $movie = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$movie) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Movie not found'
                ]);
                exit();
            }
            
            http_response_code(200);
            echo json_encode($movie);
            exit();
        }
        
        // Get all movies or filter by status
        $status = $_GET['status'] ?? null;
        
        if ($status && in_array($status, ['upcoming', 'now_showing', 'ended'])) {
            $query = "SELECT * FROM movies WHERE status = ? ORDER BY release_date DESC";
            $stmt = $conn->prepare($query);
            $stmt->execute([$status]);
        } else {
            // Get all movies ordered by release date
            $query = "SELECT * FROM movies ORDER BY release_date DESC, title ASC";
            $stmt = $conn->prepare($query);
            $stmt->execute();
        }
        
        $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($movies);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching movies: ' . $e->getMessage()
        ]);
    }
}

// CREATE new movie (ADMIN only)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();
    
    // Check if user is admin
    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden: Only admins can create movies'
        ]);
        exit();
    }
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($input['title'], $input['duration_minutes'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Title and duration are required'
            ]);
            exit();
        }
        
        $query = "INSERT INTO movies (title, original_title, description, duration_minutes, 
                                     release_date, director, genre, language, rating, 
                                     imdb_rating, poster_url, status) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($query);
        $result = $stmt->execute([
            $input['title'],
            $input['original_title'] ?? null,
            $input['description'] ?? null,
            $input['duration_minutes'],
            $input['release_date'] ?? null,
            $input['director'] ?? null,
            $input['genre'] ?? null,
            $input['language'] ?? 'English',
            $input['rating'] ?? 'PG-13',
            $input['imdb_rating'] ?? null,
            $input['poster_url'] ?? null,
            $input['status'] ?? 'upcoming'
        ]);
        
        if ($result) {
            $movie_id = $conn->lastInsertId();
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Movie created successfully',
                'movie_id' => $movie_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create movie'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error creating movie: ' . $e->getMessage()
        ]);
    }
}

// UPDATE movie (ADMIN only)
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();
    
    // Check if user is admin
    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden: Only admins can update movies'
        ]);
        exit();
    }
    
    try {
        $movie_id = $_GET['id'] ?? null;
        
        if (!$movie_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Movie ID is required'
            ]);
            exit();
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Build dynamic update query
        $fields = [];
        $params = [];
        $allowed_fields = ['title', 'original_title', 'description', 'duration_minutes', 
                          'release_date', 'director', 'genre', 'language', 'rating', 
                          'imdb_rating', 'poster_url', 'status'];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No fields to update'
            ]);
            exit();
        }
        
        $params[] = $movie_id;
        $query = "UPDATE movies SET " . implode(', ', $fields) . " WHERE movie_id = ?";
        $stmt = $conn->prepare($query);
        $result = $stmt->execute($params);
        
        if ($result) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Movie updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update movie'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating movie: ' . $e->getMessage()
        ]);
    }
}

// DELETE movie (ADMIN only)
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    require_once '../auth/check-auth.php';
    $auth_user = checkAuth();
    
    // Check if user is admin
    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden: Only admins can delete movies'
        ]);
        exit();
    }
    
    try {
        $movie_id = $_GET['id'] ?? null;
        
        if (!$movie_id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Movie ID is required'
            ]);
            exit();
        }
        
        // Delete movie (foreign keys handle cascade deletes)
        $query = "DELETE FROM movies WHERE movie_id = ?";
        $stmt = $conn->prepare($query);
        $result = $stmt->execute([$movie_id]);
        
        if ($result) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Movie deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete movie'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting movie: ' . $e->getMessage()
        ]);
    }
}

else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

$conn = null;