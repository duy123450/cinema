<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';
require_once '../config/mail-config.php';
require_once '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

define('IS_DEV_ENV', true);

$conn = connectDB();

// SET TIMEZONE FOR MYSQL SESSION
$conn->exec("SET time_zone = '+00:00'"); // Use UTC

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';

    // Validate email
    if (empty($email)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email is required"
        ]);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email format"
        ]);
        exit();
    }

    // Find user by email
    $sql = "SELECT user_id, email, username FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // Security: Don't reveal if email exists or not
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "If this email exists, a password reset link has been sent"
        ]);
        exit();
    }

    // Generate reset token
    $reset_token = bin2hex(random_bytes(32));
    $token_expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Save token to database
    $update_sql = "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE user_id = ?";
    $update_stmt = $conn->prepare($update_sql);
    $update_result = $update_stmt->execute([$reset_token, $token_expiry, $user['user_id']]);

    if (!$update_result) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to process request"
        ]);
        exit();
    }

    // Generate reset link
    $reset_link = (IS_DEV_ENV
        ? "http://localhost:5173"
        : "https://your-domain.com") . "/reset-password?token=" . urlencode($reset_token);

    // Send email using PHPMailer
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = MAIL_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USERNAME;
        $mail->Password = MAIL_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = MAIL_PORT;

        $mail->setFrom(MAIL_USERNAME, MAIL_SENDER_NAME);
        $mail->addAddress($email, $user['username']);

        $mail->isHTML(true);
        $mail->Subject = "Password Reset Request - CINEMA";
        $mail->Body = "
            <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2 style='color: #333;'>Password Reset Request</h2>
                    <p>Hi " . htmlspecialchars($user['username']) . ",</p>
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <p><a href='" . htmlspecialchars($reset_link) . "' style='background-color: #FFD700; padding: 10px 20px; text-decoration: none; color: black; font-weight: bold; display: inline-block; border-radius: 5px;'>Reset Password</a></p>
                    <p style='color: #666; font-size: 12px;'>Link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br><strong>CINEMA Team</strong></p>
                </body>
            </html>
        ";
        $mail->AltBody = "You requested a password reset. Copy and paste this link to reset your password: " . $reset_link;

        $mail->send();

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Password reset link sent to your email"
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to send reset link. Please try again later."
        ]);
    }
}

$conn = null;
