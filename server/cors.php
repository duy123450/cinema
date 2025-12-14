<?php
// Load environment variables first
function loadEnvForCORS() {
    $env_file = null;
    $environment = $_SERVER['ENVIRONMENT'] ?? getenv('ENVIRONMENT') ?? 'development';
    
    if ($environment === 'production') {
        $env_file = __DIR__ . '/.env.infinityfree';
    } else {
        $env_file = __DIR__ . '/.env.local';
    }
    
    if (file_exists($env_file)) {
        $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                putenv("$key=$value");
            }
        }
    }
}

loadEnvForCORS();

// Start session on every request with proper configuration
if (session_status() === PHP_SESSION_NONE) {
    // Configure session settings BEFORE starting session
    ini_set('session.use_strict_mode', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');
    ini_set('session.cookie_samesite', 'None');
    
    $is_https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
    
    session_set_cookie_params([
        'lifetime' => 3600,           // 1 hour
        'path' => '/',
        'domain' => '',
        'secure' => $is_https,        // Only use secure on HTTPS
        'httponly' => true,           // Prevent JavaScript access
        'samesite' => $is_https ? 'None' : 'Lax'    // Allow cross-origin requests
    ]);
    
    session_start();
}

// Get environment
$environment = getenv('ENVIRONMENT') ?: 'development';

// Define allowed origins based on environment
$allowed_origins = [];

if ($environment === 'development') {
    $allowed_origins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://localhost/server',
    ];
} elseif ($environment === 'production') {
    // Production: ALWAYS include both URLs
    $allowed_origins = [
        'https://cinema-phi-five.vercel.app',
        'https://qwertyuiop.infinityfreeapp.com',
    ];
    
    // Also add from environment variable if set
    $production_origin = getenv('ALLOWED_ORIGIN');
    if ($production_origin && !in_array($production_origin, $allowed_origins)) {
        $allowed_origins[] = $production_origin;
    }
}

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if the origin is in our allowed list
$origin_allowed = false;
foreach ($allowed_origins as $allowed) {
    if ($origin === $allowed) {
        $origin_allowed = true;
        break;
    }
}

if ($origin_allowed) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Max-Age: 86400");
} else {
    // Log blocked origins for debugging (remove in production if not needed)
    error_log("CORS blocked request from: $origin");
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}