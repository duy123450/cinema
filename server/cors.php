<?php
// Start session on every request
if (!isset($_SESSION)) {
    // Set session cookie parameters for better compatibility
    session_set_cookie_params([
        'lifetime' => 3600,      // 1 hour
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,      // Prevent JavaScript access
        'samesite' => 'None'      // Allow cross-origin requests
    ]);
    session_start();
}

// Get environment
$environment = getenv('ENVIRONMENT') ?: 'development';

if ($environment === 'development') {
    $allowed_origins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost',
        'http://localhost/server'
    ];
} else {    
    $allowed_origins = [
        'https://cinema-phi-five.vercel.app'
    ];
}

# Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

# Check if the origin is in our allowed list
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
