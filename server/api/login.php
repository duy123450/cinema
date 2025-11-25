<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

if (!isset($_SESSION)) {
    session_start();
}

$conn = connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $identifier = $input['identifier'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($identifier) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, // 👈 Add this
            "message" => "Username/Email and password are required"
        ]);
        exit();
    }

    // Get user from database with ALL fields
    if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
        $sql = "SELECT user_id, username, email, first_name, last_name, phone, role, password_hash FROM users WHERE email = ? AND status = 'active'";
    } else {
        $sql = "SELECT user_id, username, email, first_name, last_name, phone, role, password_hash FROM users WHERE username = ? AND status = 'active'";
    }

    $stmt = $conn->prepare($sql);
    $stmt->execute([$identifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        // Set default avatar if missing or null
        $avatar = $user['avatar'] ?? 'default-avatar.png';

        $_SESSION["user"] = [
            "user_id" => $user['user_id'],
            "username" => $user['username'],
            "email" => $user['email'],
            "first_name" => $user['first_name'],
            "last_name" => $user['last_name'],
            "phone" => $user['phone'],
            "role" => $user['role'],
            "avatar" => $avatar,
            "created_at" => time()
        ];

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "user" => [
                "user_id" => $user['user_id'],
                "username" => $user['username'],
                "email" => $user['email'],
                "first_name" => $user['first_name'],
                "last_name" => $user['last_name'],
                "phone" => $user['phone'],
                "role" => $user['role'],
                "avatar" => $avatar
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid username/email or password"
        ]);
    }
}

$conn = null;
