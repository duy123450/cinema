<?php
require_once '../cors.php';
require_once '../config/dbconnect.php';
require_once '../config/mail-config.php';
require_once '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Define environment constant for link generation
define('IS_DEV_ENV', true); // CHANGE TO 'false' WHEN DEPLOYING TO PRODUCTION!

$conn = connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ... (All previous validation and database code remains the same) ...
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    // ... (Input validation) ...

    $sql = "SELECT user_id, email, username FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "If this email exists, a password reset link has been sent"
        ]);
        exit();
    }

    $reset_token = bin2hex(random_bytes(32));
    $token_expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $update_sql = "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE user_id = ?";
    $update_stmt = $conn->prepare($update_sql);
    $update_result = $update_stmt->execute([$reset_token, $token_expiry, $user['user_id']]);

    if ($update_result) {
        // Generate reset link
        $reset_link = (IS_DEV_ENV
            ? "http://localhost:5173"
            : "https://your-domain.com") . "/reset-password?token=" . $reset_token;

        // ---------------------------------------------
        // SEND EMAIL USING PHPMailer
        // ---------------------------------------------
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = MAIL_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = MAIL_USERNAME;
            $mail->Password = MAIL_PASSWORD;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Use ENCRYPTION_SMTPS for port 465
            $mail->Port = MAIL_PORT;

            // Recipients
            $mail->setFrom(MAIL_USERNAME, MAIL_SENDER_NAME);
            $mail->addAddress($email, $user['username']);

            // Content
            $mail->isHTML(true);
            $mail->Subject = "Password Reset Request - CINEMA";
            $mail->Body = "
                <html>
                    <body>
                        <h2>Password Reset Request</h2>
                        <p>Hi " . htmlspecialchars($user['username']) . ",</p>
                        <p>You requested a password reset. Click the link below to reset your password:</p>
                        <p><a href='" . htmlspecialchars($reset_link) . "'>Reset Password</a></p>
                        <p>This link will expire in 1 hour.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                        <p>Best regards,<br>CINEMA Team</p>
                    </body>
                </html>
            ";
            $mail->AltBody = "You requested a password reset. Copy and paste this link to reset your password: " . $reset_link;

            $mail->send();

            // Success response
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Password reset link sent to your email"
            ]);
        } catch (Exception $e) {
            // Email sending failed
            error_log("Email sending failed for " . $email . ". Mailer Error: {$mail->ErrorInfo}");
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Failed to send reset link. Please try again later."
            ]);
        }
        // ---------------------------------------------

    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to process request"
        ]);
    }
}

$conn = null;
