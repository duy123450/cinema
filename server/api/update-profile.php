<?php
require_once '../auth/check-auth.php';
require_once '../config/dbconnect.php';

$conn = connectDB();
$auth_user = checkAuth();


$user_id = $_POST['user_id'];

error_log("Session user ID: " . $auth_user['user_id']);
error_log("Request user ID: " . $user_id);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

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
    $allowed_fields = ['username', 'email', 'first_name', 'last_name', 'phone'];

    foreach ($allowed_fields as $field) {
        if (isset($profileData[$field])) {
            $fields[] = "$field = ?";
            $params[] = $profileData[$field];
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
                // 👇 Convert to JPG if necessary
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
        // Fetch updated user data
        $updated_user_query = "SELECT user_id, username, email, first_name, last_name, phone, role, avatar FROM users WHERE user_id = ?";
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

$conn = null;
