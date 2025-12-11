<?php
require_once '../auth/check-auth.php';
require_once '../config/dbconnect.php';

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'");

$auth_user = checkAuth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Single user by ID
        $user_id = $_GET['id'] ?? null;

        if ($user_id) {
            $query = "SELECT user_id, username, email, first_name, last_name, phone, date_of_birth, role, avatar, status, created_at FROM users WHERE user_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'User not found']);
                exit();
            }

            http_response_code(200);
            echo json_encode($user);
            exit();
        }

        // List all users (admin only)
        if ($auth_user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: Admin access required']);
            exit();
        }

        $query = "SELECT user_id, username, email, first_name, last_name, phone, date_of_birth, role, avatar, status, created_at FROM users ORDER BY user_id DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($users);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error fetching users: ' . $e->getMessage()]);
    }
}

// CREATE USER (admin-only) or UPDATE PROFILE (self)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Try to get JSON input first (for user creation)
    $input = json_decode(file_get_contents('php://input'), true);

    // Check if this is a new user creation (JSON input with required fields)
    if (!empty($input) && isset($input['username']) && isset($input['email']) && isset($input['password'])) {
        // CREATE NEW USER (admin-only)
        if ($auth_user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: Admin access required']);
            exit();
        }

        $username = $input['username'] ?? null;
        $email = $input['email'] ?? null;
        $password = $input['password'] ?? null;
        $first_name = $input['first_name'] ?? null;
        $last_name = $input['last_name'] ?? null;
        $role = $input['role'] ?? 'customer';
        $status = $input['status'] ?? 'active';

        if (!$username || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields: username, email, password']);
            exit();
        }

        // Check if user already exists
        $checkStmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? OR username = ?");
        $checkStmt->execute([$email, $username]);
        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User already exists']);
            exit();
        }

        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insert new user
        $insertStmt = $conn->prepare("INSERT INTO users (username, email, password_hash, first_name, last_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
        $result = $insertStmt->execute([$username, $email, $hashed_password, $first_name, $last_name, $role, $status]);

        if ($result) {
            $new_user_id = $conn->lastInsertId();
            $fetchStmt = $conn->prepare("SELECT user_id, username, email, first_name, last_name, role, status, created_at FROM users WHERE user_id = ?");
            $fetchStmt->execute([$new_user_id]);
            $new_user = $fetchStmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'User created successfully',
                'user' => $new_user
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create user']);
        }
        exit();
    }

    // PROFILE UPDATE (from form data)
    $user_id = $_POST['user_id'] ?? null;

    if ($auth_user['user_id'] != $user_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit();
    }

    // Get profile data
    $profileData = json_decode($_POST['profile_data'] ?? '{}', true);

    if (!is_array($profileData)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid profile data']);
        exit();
    }

    // Build update query
    $fields = [];
    $params = [];
    $allowed_fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'date_of_birth'];

    foreach ($allowed_fields as $field) {
        if (isset($profileData[$field])) {
            $fields[] = "$field = ?";
            $params[] = $profileData[$field] ?: null;
        }
    }

    // Handle avatar upload (optional)
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['avatar'];
        $allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/jpg',
            'image/jfif'
        ];

        if (in_array($file['type'], $allowedTypes) && $file['size'] <= 2 * 1024 * 1024) {
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $avatar_filename = 'avatar_' . time() . '_' . uniqid() . '.jpg';
            $uploadDir = __DIR__ . '/../uploads/';
            $targetPath = $uploadDir . $avatar_filename;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // Convert to JPG if necessary
                $image = imagecreatefromstring(file_get_contents($targetPath));
                if ($image) {
                    imagejpeg($image, $targetPath, 90); // Save as JPG
                    imagedestroy($image);
                }
                $fields[] = "avatar = ?";
                $params[] = $avatar_filename;
            }
        }
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit();
    }

    $params[] = $user_id;
    $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE user_id = ?";
    $stmt = $conn->prepare($query);
    $result = $stmt->execute($params);

    if ($result) {
        // Fetch updated user data with phone and date_of_birth
        $updated_user_query = "SELECT user_id, username, email, first_name, last_name, phone, date_of_birth, role, avatar FROM users WHERE user_id = ?";
        $updated_stmt = $conn->prepare($updated_user_query);
        $updated_stmt->execute([$user_id]);
        $updated_user = $updated_stmt->fetch(PDO::FETCH_ASSOC);

        if ($updated_user) {
            $_SESSION['user'] = $updated_user;
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $updated_user
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
    }
}

// UPDATE USER (ADMIN ONLY - role/status)
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden: Admin access required']);
        exit();
    }

    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = $_GET['id'] ?? $input['user_id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing user id']);
            exit();
        }

        $fields = [];
        $params = [];

        if (isset($input['role']) && in_array($input['role'], ['customer', 'staff', 'admin'])) {
            $fields[] = 'role = ?';
            $params[] = $input['role'];
        }

        if (isset($input['status']) && in_array($input['status'], ['active', 'suspended'])) {
            $fields[] = 'status = ?';
            $params[] = $input['status'];
        }

        if (isset($input['username'])) {
            $fields[] = 'username = ?';
            $params[] = $input['username'];
        }

        if (isset($input['email'])) {
            $fields[] = 'email = ?';
            $params[] = $input['email'];
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit();
        }

        $params[] = $user_id;
        $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE user_id = ?";
        $stmt = $conn->prepare($query);
        $result = $stmt->execute($params);

        if ($result) {
            // Fetch updated user
            $fetchQ = "SELECT user_id, username, email, first_name, last_name, phone, date_of_birth, role, avatar, status, created_at FROM users WHERE user_id = ?";
            $fstmt = $conn->prepare($fetchQ);
            $fstmt->execute([$user_id]);
            $updated = $fstmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully',
                'user' => $updated
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update user']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating user: ' . $e->getMessage()]);
    }
}

// DELETE USER (ADMIN ONLY)
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if ($auth_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden: Admin access required']);
        exit();
    }

    try {
        $user_id = $_GET['id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing user id']);
            exit();
        }

        // Prevent self-deletion
        if ($user_id == $auth_user['user_id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Cannot delete your own account']);
            exit();
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
        $res = $stmt->execute([$user_id]);

        if ($res) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete user']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting user: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

$conn = null;
