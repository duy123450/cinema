<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

function checkAuth()
{
    // Session should already be started by cors.php
    if (!isset($_SESSION['user']) || !$_SESSION['user']) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: No active session']);
        exit();
    }

    // Optional: Check if user still exists in database
    $conn = connectDB();
    $user_id = $_SESSION['user']['user_id'];
    $sql = "SELECT user_id, status FROM users WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['status'] !== 'active') {
        // Destroy session if user is not active
        session_destroy();
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: User account not active']);
        exit();
    }

    return $user;
}