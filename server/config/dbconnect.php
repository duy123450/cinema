<?php
// Thông tin kết nối
$host = 'localhost'; // Địa chỉ máy chủ cơ sở dữ liệu
$dbname = 'cinema_management'; // Tên cơ sở dữ liệu
$username = 'root'; // Tên người dùng
$password = ''; // Mật khẩu
try {
    // Tạo kết nối PDO
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname",
        $username,
        $password
    );
    // Thiết lập chế độ lỗi
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Kết nối thành công!";
} catch (PDOException $e) {
    echo "Lỗi kết nối: " . $e->getMessage();
}


// <?php
// // Load environment variables manually
// $envFile = __DIR__ . '/../.env';
// if (file_exists($envFile)) {
//     $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
//     foreach ($lines as $line) {
//         if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
//             list($key, $value) = explode('=', $line, 2);
//             $_ENV[trim($key)] = trim($value);
//         }
//     }
// }

// class Database {
//     private $conn;
    
//     public function getConnection() {
//         if ($this->conn === null) {
//             try {
//                 $this->conn = new PDO(
//                     "mysql:host=" . ($_ENV['DB_HOST'] ?? 'localhost') . 
//                     ";dbname=" . ($_ENV['DB_NAME'] ?? 'cinema_management') . 
//                     ";charset=utf8mb4",
//                     $_ENV['DB_USER'] ?? 'root',
//                     $_ENV['DB_PASSWORD'] ?? '',
//                     [
//                         PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
//                         PDO::ATTR_PERSISTENT => true,
//                         PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
//                         PDO::ATTR_EMULATE_PREPARES => false,
//                     ]
//                 );
//             } catch(PDOException $e) {
//                 error_log("Database connection failed: " . $e->getMessage());
//                 throw new Exception("Database connection failed");
//             }
//         }
//         return $this->conn;
//     }
// }
// ?>