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
        'secure' => $is_https,
        'httponly' => true,           // Prevent JavaScript access
        'samesite' => 'None'          // Allow cross-origin requests
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
    // Production origins from environment or hardcoded
    $production_origin = getenv('ALLOWED_ORIGIN');
    
    if ($production_origin) {
        $allowed_origins[] = $production_origin;
    }
    
    // Always allow these in production
    $allowed_origins = array_merge($allowed_origins, [
        'https://cinema-phi-five.vercel.app',
        'https://qwertyuiop.infinityfreeapp.com',
    ]);
}

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if the origin is in our allowed list
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

// Allowed methods
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Allowed headers (important for JSON requests, auth, etc.)
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Optional: cache preflight response for 1 day (reduces OPTIONS requests)
header("Access-Control-Max-Age: 86400");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}