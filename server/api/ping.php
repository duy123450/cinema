<?php
require_once '../cors.php';

// Keep session alive
if (isset($_SESSION['user'])) {
    http_response_code(200);
    echo json_encode(['status' => 'active']);
} else {
    http_response_code(401);
    echo json_encode(['status' => 'inactive']);
}
