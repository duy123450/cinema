<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

// This endpoint helps verify your setup is correct
// Access: http://localhost/server/api/setup-verify.php
//         https://qwertyuiop.infinityfreeapp.com/api/setup-verify.php

header('Content-Type: application/json');

$checks = [
    'environment' => getenv('ENVIRONMENT') ?: 'unknown',
    'php_version' => phpversion(),
    'server' => $_SERVER['HTTP_HOST'] ?? 'unknown',
    'https' => isset($_SERVER['HTTPS']) ? 'yes' : 'no',
    'session_status' => session_status() === PHP_SESSION_ACTIVE ? 'active' : 'inactive',
];

// Test database connection
$db_test = [
    'host' => getenv('DB_HOST'),
    'database' => getenv('DB_NAME'),
    'user' => getenv('DB_USER'),
];

try {
    $conn = connectDB();
    $stmt = $conn->prepare("SELECT VERSION() as version");
    $stmt->execute();
    $result = $stmt->fetch();
    $db_test['connection'] = 'success';
    $db_test['mysql_version'] = $result['version'] ?? 'unknown';
    $conn = null;
} catch (Exception $e) {
    $db_test['connection'] = 'failed';
    $db_test['error'] = $e->getMessage();
}

// Test file uploads directory
$upload_dir = __DIR__ . '/../../uploads';
$upload_test = [
    'path' => $upload_dir,
    'exists' => is_dir($upload_dir),
    'writable' => is_writable($upload_dir),
];

// Create uploads directory if it doesn't exist
if (!is_dir($upload_dir)) {
    @mkdir($upload_dir, 0755, true);
    $upload_test['created'] = true;
    $upload_test['writable'] = is_writable($upload_dir);
}

$response = [
    'status' => 'success',
    'environment_info' => $checks,
    'database_info' => $db_test,
    'file_upload_info' => $upload_test,
    'deployment_info' => [
        'vercel_url' => 'https://cinema-phi-five.vercel.app',
        'infinityfree_url' => 'https://qwertyuiop.infinityfreeapp.com',
        'current_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'unknown',
    ],
    'cors_headers' => [
        'Access-Control-Allow-Origin' => getallheaders()['Access-Control-Allow-Origin'] ?? 'not set',
        'Access-Control-Allow-Credentials' => getallheaders()['Access-Control-Allow-Credentials'] ?? 'not set',
    ]
];

if ($db_test['connection'] === 'success') {
    http_response_code(200);
} else {
    http_response_code(500);
    $response['status'] = 'error';
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);