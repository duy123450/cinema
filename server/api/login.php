<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';

@session_start();
$conn = connectDB();
$conn->exec("SET time_zone = '+00:00'");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit(json_encode(['success' => false]));

$in = json_decode(file_get_contents('php://input'), true);
$id = $in['identifier'] ?? '';
$pwd = $in['password'] ?? '';

if (!$id || !$pwd) exit(json_encode(['success' => false, 'message' => 'Required']));

$is_email = filter_var($id, FILTER_VALIDATE_EMAIL);
$sql = "SELECT * FROM users WHERE " . ($is_email ? 'email' : 'username') . " = ? AND status = 'active'";
$u = $conn->prepare($sql);
$u->execute([$id]);
$user = $u->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($pwd, $user['password_hash'])) {
    $conn->prepare("UPDATE users SET status = 'active' WHERE user_id = ?")->execute([$user['user_id']]);

    $data = [
        'user_id' => $user['user_id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'phone' => $user['phone'],
        'date_of_birth' => $user['date_of_birth'],
        'role' => $user['role'],
        'avatar' => $user['avatar'] ?? 'default.png'
    ];

    $_SESSION['user'] = array_merge($data, ['created_at' => time()]);
    exit(json_encode(['success' => true, 'message' => 'Login ok', 'user' => $data]));
} else {
    http_response_code(401);
    exit(json_encode(['success' => false, 'message' => 'Invalid credentials']));
}

$conn = null;
