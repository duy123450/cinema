<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

if (!isset($_SESSION)) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get user data from form
    $userData = json_decode($_POST['user_data'] ?? '{}', true);

    if (!$userData || !isset($userData['username'], $userData['email'], $userData['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user data']);
        exit();
    }

    $conn = connectDB();

    // Check if username or email already exists
    $checkQuery = "SELECT user_id FROM users WHERE username = ? OR email = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->execute([$userData['username'], $userData['email']]);

    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
        exit();
    }

    // Hash password
    $password_hash = password_hash($userData['password'], PASSWORD_DEFAULT);

    // Handle avatar upload (optional)
    $avatar_filename = 'default-avatar.png';
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['avatar'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (in_array($file['type'], $allowedTypes) && $file['size'] <= 2 * 1024 * 1024) {
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $avatar_filename = 'avatar_' . time() . '_' . uniqid() . '.' . $fileExtension;
            $uploadDir = __DIR__ . '/../../uploads/';
            $targetPath = $uploadDir . $avatar_filename;

            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                // If upload fails, use default avatar
                $avatar_filename = 'default-avatar.png';
            }
        }
    }

    // Insert new user
    $query = "INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role, status, avatar) VALUES (?, ?, ?, ?, ?, ?, 'customer', 'active', ?)";
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        $userData['username'],
        $userData['email'],
        $password_hash,
        $userData['first_name'] ?? '',
        $userData['last_name'] ?? '',
        $userData['phone'] ?? '',
        $avatar_filename
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'User created successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create user']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
