<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

if (!isset($_SESSION)) {
    session_start();
}

// Check if user is logged in
if (isset($_SESSION['user']) && !empty($_SESSION['user'])) {
    $user_id = $_SESSION['user']['user_id'];

    // Update user status to inactive
    try {
        $conn = connectDB();
        $query = "UPDATE users SET status = 'inactive' WHERE user_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$user_id]);
        $conn = null;
    } catch (Exception $e) {
        error_log("Error updating user status on logout: " . $e->getMessage());
    }
}

// Clear session
session_destroy();

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
