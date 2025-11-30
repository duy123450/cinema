<?php
// Backend routing with switch case
require_once 'cors.php';

// Get the requested path
$request_uri = $_SERVER['REQUEST_URI'];
$requested_path = parse_url($request_uri, PHP_URL_PATH);

// Remove leading slash and split path
$path_parts = array_values(array_filter(explode('/', $requested_path)));

// Get the first part (API endpoint)
$endpoint = $path_parts[0] ?? '';
$sub_endpoint = $path_parts[1] ?? '';

$method = $_SERVER['REQUEST_METHOD'];

// Handle API requests only
if ($endpoint === 'api' && isset($sub_endpoint)) {
    $api_file = $sub_endpoint;

    // Handle files with parameters (like ?id=1)
    $api_file = strtok($api_file, '?');

    switch ($api_file) {
        case 'login':
            require_once 'api/login.php';
            break;

        case 'register':
            require_once 'api/register.php';
            break;

        case 'update-profile':
            require_once 'api/update-profile.php';
            break;

        case 'update-password':
            require_once 'api/update-password.php';
            break;

        case 'upload-avatar':
            require_once 'api/upload-avatar.php';
            break;

        case 'users':
            require_once 'api/users.php';
            break;

        case 'movies':
            require_once 'api/movies.php';
            break;

        case 'showtimes':
            require_once 'api/showtimes.php';
            break;

        case 'theaters':
        case 'cinemas':
            require_once 'api/cinemas.php';
            break;

        case 'bookings':
            require_once 'api/bookings.php';
            break;

        case 'ping':
            require_once 'api/ping.php';
            break;

        case 'logout':
            require_once 'api/logout.php';
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'API endpoint not found']);
            break;
    }
} else {
    // Serve React app for all non-API routes
    $react_app = __DIR__ . '/dist/index.html';

    if (file_exists($react_app)) {
        // Try to serve static assets first
        $file_path = __DIR__ . '/dist' . $requested_path;

        if (file_exists($file_path) && !is_dir($file_path)) {
            // Serve static file with correct MIME type
            $mime_types = [
                'css' => 'text/css',
                'js' => 'application/javascript',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                'ico' => 'image/x-icon',
                'woff' => 'font/woff',
                'woff2' => 'font/woff2',
                'ttf' => 'font/ttf',
                'eot' => 'application/vnd.ms-fontobject',
                'json' => 'application/json'
            ];

            $path_info = pathinfo($file_path);
            $extension = strtolower($path_info['extension'] ?? '');

            if (isset($mime_types[$extension])) {
                header('Content-Type: ' . $mime_types[$extension]);
            }

            readfile($file_path);
        } else {
            // Serve React app for SPA routing
            header('Content-Type: text/html');
            readfile($react_app);
        }
    } else {
        http_response_code(404);
        echo "React app not found. Please run 'npm run build'";
    }
}
