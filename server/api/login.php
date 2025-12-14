<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

if (!isset($_SESSION)) {
    session_start();
}

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Sanitize and validate inputs
    $identifier = isset($input['identifier']) ? trim($input['identifier']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';

    // Validate inputs
    if (empty($identifier) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Username/Email and password are required"
        ]);
        exit();
    }

    try {
        // Check if identifier is email or username
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $sql = "SELECT user_id, username, email, first_name, last_name, phone, date_of_birth, role, password_hash, avatar, status FROM users WHERE email = ?";
        } else {
            $sql = "SELECT user_id, username, email, first_name, last_name, phone, date_of_birth, role, password_hash, avatar, status FROM users WHERE username = ?";
        }

        $stmt = $conn->prepare($sql);
        $stmt->execute([$identifier]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Check if user exists and password is correct
        if (!$user) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Invalid username/email or password"
            ]);
            exit();
        }

        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Invalid username/email or password"
            ]);
            exit();
        }

        // Set default avatar if missing or null
        $avatar = !empty($user['avatar']) ? $user['avatar'] : 'default-avatar.png';

        // Update user status to active on successful login
        $update_sql = "UPDATE users SET status = 'active', updated_at = NOW() WHERE user_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->execute([$user['user_id']]);

        // Update last login or user status
        $update_sql = "UPDATE users SET status = 'active', updated_at = NOW() WHERE user_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->execute([$user['user_id']]);

        // Set session data
        $_SESSION["user"] = [
            "user_id" => $user['user_id'],
            "username" => $user['username'],
            "email" => $user['email'],
            "first_name" => $user['first_name'] ?? '',
            "last_name" => $user['last_name'] ?? '',
            "phone" => $user['phone'] ?? '',
            "date_of_birth" => $user['date_of_birth'] ?? '',
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
                "first_name" => $user['first_name'] ?? '',
                "last_name" => $user['last_name'] ?? '',
                "phone" => $user['phone'] ?? '',
                "date_of_birth" => $user['date_of_birth'] ?? '',
                "role" => $user['role'],
                "avatar" => $avatar
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
}

$conn = null;