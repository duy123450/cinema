<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'"); // Use UTC

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $token = $input['token'] ?? '';
    $password = $input['password'] ?? '';

    // Validate inputs
    if (empty($token) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Token and password are required'
        ]);
        exit();
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Password must be at least 6 characters'
        ]);
        exit();
    }

    // Find user with valid reset token
    $query = "SELECT user_id, reset_token, reset_token_expiry FROM users 
              WHERE reset_token = ? AND reset_token_expiry > NOW()";

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error']);
        exit();
    }

    $result = $stmt->execute([$token]);

    if (!$result) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error']);
        exit();
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired reset token'
        ]);
        exit();
    }

    // Hash new password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Update password and clear reset token
    $update_query = "UPDATE users 
                     SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL 
                     WHERE user_id = ?";
    $update_stmt = $conn->prepare($update_query);
    $update_result = $update_stmt->execute([$password_hash, $user['user_id']]);

    if ($update_result) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Password reset successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to reset password'
        ]);
    }
}

$conn = null;
