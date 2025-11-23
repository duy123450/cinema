<?php
require_once 'cors.php';

// Serve React app for all routes that don't match PHP files
if (strpos($_SERVER['REQUEST_URI'], '/api/') !== 0) {
    if (file_exists('../frontend/dist/index.html')) {
        readfile('../frontend/dist/index.html');
    } else {
        http_response_code(404);
        echo "React app not found. Please run 'npm run build'";
    }
    exit();
}

// For API routes
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

if (isset($path_parts[1]) && $path_parts[1] === 'api') {
    $endpoint = $path_parts[2] ?? '';

    switch ($endpoint) {
        case 'movies':
            require_once 'api/movies.php';
            break;
        case 'showtimes':
            require_once 'api/showtimes.php';
            break;
        case 'cinemas':
            require_once 'api/cinemas.php';
            break;
        case 'users':
            require_once 'api/users.php';
            break;
        case 'auth':
            require_once 'api/auth.php';
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Invalid API route']);
}
