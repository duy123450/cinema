<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

if (!isset($_SESSION)) {
    session_start();
}

// Clear session
session_destroy();

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
