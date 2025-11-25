    <?php
    require_once '../auth/check-auth.php';
    require_once '../config/dbconnect.php';

    $conn = connectDB();
    $auth_user = checkAuth();

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $user_id = $_GET['id'] ?? null;

        if ($auth_user['user_id'] != $user_id) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            exit();
        }

        $rawData = file_get_contents('php://input');
        $input = json_decode($rawData, true);

        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON format']);
            exit();
        }

        // Build update query
        $fields = [];
        $params = [];
        $allowed_fields = ['username', 'email', 'first_name', 'last_name', 'phone'];

        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $params[] = $input[$field];
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
            // 👇 CRITICAL: Fetch the UPDATED user data from database
            $updated_user_query = "SELECT user_id, username, email, first_name, last_name, phone, role, status FROM users WHERE user_id = ?";
            $updated_stmt = $conn->prepare($updated_user_query);
            $updated_stmt->execute([$user_id]);
            $updated_user = $updated_stmt->fetch(PDO::FETCH_ASSOC);

            if ($updated_user) {
                $_SESSION['user'] = $updated_user;
            }

            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
        }
    }

    $conn = null;
