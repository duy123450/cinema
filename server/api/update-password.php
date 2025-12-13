<?php
require_once '../auth/check-auth.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$auth_user = checkAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $user_id = $input['user_id'] ?? null;
    $current_password = $input['current_password'] ?? '';
    $new_password = $input['new_password'] ?? '';

    // Verify user is updating their own password
    if ($auth_user['user_id'] != $user_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit();
    }

    // Validate inputs
    if (empty($current_password) || empty($new_password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit();
    }

    if (strlen($new_password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters']);
        exit();
    }

    // Get current password hash from database
    $query = "SELECT password_hash FROM users WHERE user_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit();
    }

    // Verify current password
    if (!password_verify($current_password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit();
    }

    // Hash new password
    $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

    // Update password
    $update_query = "UPDATE users SET password_hash = ? WHERE user_id = ?";
    $update_stmt = $conn->prepare($update_query);
    $result = $update_stmt->execute([$new_password_hash, $user_id]);

    if ($result) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update password']);
    }
}

$conn = null;
