<?php
require_once '../cors.php';
require_once '../auth/check-auth.php';
require_once '../config/dbconnect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user']['user_id'];

    // Check if file was uploaded
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit();
    }

    $file = $_FILES['avatar'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/jfif'];

    // Validate file type
    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
        exit();
    }

    // Validate file size (max 2MB)
    if ($file['size'] > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File too large']);
        exit();
    }

    // Generate unique filename
    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'avatar_' . $user_id . '_' . time() . '.jpg';
    $targetPath = __DIR__ . '/../uploads/' . $filename;

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Convert to JPG if necessary
        $image = imagecreatefromstring(file_get_contents($targetPath));
        if ($image) {
            imagejpeg($image, $targetPath, 90); // Save as JPG
            imagedestroy($image);
        }

        // Update database
        $conn = connectDB();        $sql = "UPDATE users SET avatar = ? WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([$filename, $user_id]);

        if ($result) {
            // Update session
            $_SESSION['user']['avatar'] = $filename;
            http_response_code(200);
            echo json_encode(['success' => true, 'avatar_filename' => $filename]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save avatar']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
