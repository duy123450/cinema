<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Auto-update movie status based on release_date and end_date
        $today = date('Y-m-d');

        // If today is release_date and status is 'upcoming', change to 'now_showing'
        $autoUpdateQuery = "UPDATE movies 
                           SET status = 'now_showing' 
                           WHERE status = 'upcoming' 
                           AND release_date = ?";
        $autoUpdateStmt = $conn->prepare($autoUpdateQuery);
        $autoUpdateStmt->execute([$today]);

        // If today >= end_date and status is not 'ended', change to 'ended'
        $autoEndQuery = "UPDATE movies 
                        SET status = 'ended' 
                        WHERE status IN ('upcoming', 'now_showing') 
                        AND end_date IS NOT NULL
                        AND end_date <= ?";
        $autoEndStmt = $conn->prepare($autoEndQuery);
        $autoEndStmt->execute([$today]);

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
                                     release_date, end_date, director, genre, language, rating, 
                                     imdb_rating, poster_url, status) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($query);
        // run inside transaction to allow inserting trailers and cast together
        $conn->beginTransaction();

        // Auto-set status to 'now_showing' if release_date is today
        $status = $input['status'] ?? 'upcoming';
        if (!empty($input['release_date']) && $input['release_date'] === date('Y-m-d')) {
            $status = 'now_showing';
        }

        $result = $stmt->execute([
            $input['title'],
            $input['original_title'] ?? null,
            $input['description'] ?? null,
            $input['duration_minutes'],
            $input['release_date'] ?? null,
            $input['end_date'] ?? null,
            $input['director'] ?? null,
            $input['genre'] ?? null,
            $input['language'] ?? 'English',
            $input['rating'] ?? 'PG-13',
            $input['imdb_rating'] ?? null,
            $input['poster_url'] ?? null,
            $status
        ]);

        if ($result) {
            $movie_id = $conn->lastInsertId();

            // Insert trailers if provided
            if (!empty($input['trailers']) && is_array($input['trailers'])) {
                $trailerQuery = "INSERT INTO movie_trailers (movie_id, title, url, duration_seconds, trailer_type, language, is_featured, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                $trailerStmt = $conn->prepare($trailerQuery);
                foreach ($input['trailers'] as $idx => $tr) {
                    // Skip if URL is missing (required field)
                    if (empty($tr['url'])) continue;

                    // Sanitize trailer_type to valid enum values (case-insensitive)
                    $validTypes = ['official', 'behind_the_scenes'];
                    $trailerType = 'official'; // default value
                    if (!empty($tr['trailer_type'])) {
                        $normalizedType = strtolower(trim($tr['trailer_type']));
                        if (in_array($normalizedType, $validTypes)) {
                            $trailerType = $normalizedType;
                        }
                    }

                    $trailerStmt->execute([
                        $movie_id,
                        !empty($tr['title']) ? $tr['title'] : null,
                        $tr['url'],
                        !empty($tr['duration_seconds']) ? (int)$tr['duration_seconds'] : null,
                        $trailerType,
                        !empty($tr['language']) ? $tr['language'] : null,
                        !empty($tr['is_featured']) ? 1 : 0,
                        !empty($tr['views']) ? (int)$tr['views'] : 0
                    ]);
                }
            }

            // Insert cast if provided
            if (!empty($input['cast']) && is_array($input['cast'])) {
                $castQuery = "INSERT INTO movie_cast (movie_id, actor_id, character_name, role_type, cast_order) VALUES (?, ?, ?, ?, ?)";
                $castStmt = $conn->prepare($castQuery);
                foreach ($input['cast'] as $c) {
                    // Skip if actor_id is missing (required field)
                    if (empty($c['actor_id'])) continue;

                    // Sanitize role_type to valid enum values
                    $validRoles = ['lead', 'supporting', 'cameo'];
                    $roleType = 'supporting'; // default value
                    if (!empty($c['role_type'])) {
                        $normalizedRole = strtolower(trim($c['role_type']));
                        if (in_array($normalizedRole, $validRoles)) {
                            $roleType = $normalizedRole;
                        }
                    }

                    $castStmt->execute([
                        $movie_id,
                        (int)$c['actor_id'],
                        !empty($c['character_name']) ? $c['character_name'] : null,
                        $roleType,
                        !empty($c['cast_order']) ? (int)$c['cast_order'] : null
                    ]);
                }
            }

            $conn->commit();

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Movie created successfully',
                'movie_id' => $movie_id
            ]);
        } else {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create movie'
            ]);
        }
    } catch (Exception $e) {
        if ($conn->inTransaction()) $conn->rollBack();
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
        $allowed_fields = [
            'title',
            'original_title',
            'description',
            'duration_minutes',
            'release_date',
            'end_date',
            'director',
            'genre',
            'language',
            'rating',
            'imdb_rating',
            'poster_url',
            'status'
        ];

        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                // Auto-set status to 'now_showing' if release_date is being set to today
                if ($field === 'release_date' && $input[$field] === date('Y-m-d')) {
                    $fields[] = "status = ?";
                    $params[] = 'now_showing';
                    $fields[] = "$field = ?";
                    $params[] = $input[$field];
                } else {
                    $fields[] = "$field = ?";
                    $params[] = $input[$field];
                }
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

        // run update and optional cast/trailer sync inside transaction
        $conn->beginTransaction();
        $result = $stmt->execute($params);

        if ($result) {
            // If trailers provided, replace existing
            if (isset($input['trailers']) && is_array($input['trailers'])) {
                $delT = $conn->prepare("DELETE FROM movie_trailers WHERE movie_id = ?");
                $delT->execute([$movie_id]);
                $trailerQuery = "INSERT INTO movie_trailers (movie_id, title, url, duration_seconds, trailer_type, language, is_featured, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                $trailerStmt = $conn->prepare($trailerQuery);
                foreach ($input['trailers'] as $tr) {
                    // Skip if URL is missing (required field)
                    if (empty($tr['url'])) continue;

                    // Sanitize trailer_type to valid enum values (case-insensitive)
                    $validTypes = ['official', 'behind_the_scenes'];
                    $trailerType = 'official'; // default value
                    if (!empty($tr['trailer_type'])) {
                        $normalizedType = strtolower(trim($tr['trailer_type']));
                        if (in_array($normalizedType, $validTypes)) {
                            $trailerType = $normalizedType;
                        }
                    }

                    $trailerStmt->execute([
                        $movie_id,
                        !empty($tr['title']) ? $tr['title'] : null,
                        $tr['url'],
                        !empty($tr['duration_seconds']) ? (int)$tr['duration_seconds'] : null,
                        $trailerType,
                        !empty($tr['language']) ? $tr['language'] : null,
                        !empty($tr['is_featured']) ? 1 : 0,
                        !empty($tr['views']) ? (int)$tr['views'] : 0
                    ]);
                }
            }

            // If cast provided, replace existing
            if (isset($input['cast']) && is_array($input['cast'])) {
                $delC = $conn->prepare("DELETE FROM movie_cast WHERE movie_id = ?");
                $delC->execute([$movie_id]);
                $castQuery = "INSERT INTO movie_cast (movie_id, actor_id, character_name, role_type, cast_order) VALUES (?, ?, ?, ?, ?)";
                $castStmt = $conn->prepare($castQuery);
                foreach ($input['cast'] as $c) {
                    // Skip if actor_id is missing (required field)
                    if (empty($c['actor_id'])) continue;

                    // Sanitize role_type to valid enum values
                    $validRoles = ['lead', 'supporting', 'cameo'];
                    $roleType = 'supporting'; // default value
                    if (!empty($c['role_type'])) {
                        $normalizedRole = strtolower(trim($c['role_type']));
                        if (in_array($normalizedRole, $validRoles)) {
                            $roleType = $normalizedRole;
                        }
                    }

                    $castStmt->execute([
                        $movie_id,
                        (int)$c['actor_id'],
                        !empty($c['character_name']) ? $c['character_name'] : null,
                        $roleType,
                        !empty($c['cast_order']) ? (int)$c['cast_order'] : null
                    ]);
                }
            }

            $conn->commit();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Movie updated successfully'
            ]);
        } else {
            $conn->rollBack();
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
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

$conn = null;
