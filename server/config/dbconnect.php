<?php
// Load environment variables
function loadEnv() {
    $env_file = null;
    $environment = $_SERVER['ENVIRONMENT'] ?? getenv('ENVIRONMENT') ?? 'development';
    
    // Determine which .env file to load
    if ($environment === 'production') {
        $env_file = __DIR__ . '/../.env.infinityfree';
    } else {
        $env_file = __DIR__ . '/../.env.local';
    }
    
    // Load from .env file if it exists
    if (file_exists($env_file)) {
        $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                // Set as environment variable
                putenv("$key=$value");
            }
        }
    }
}

// Load environment variables
loadEnv();

function connectDB()
{
    // Get database credentials from environment variables
    $db_host = getenv('DB_HOST') ?: 'localhost';
    $db_user = getenv('DB_USER') ?: 'root';
    $db_password = getenv('DB_PASSWORD') ?: '';
    $db_name = getenv('DB_NAME') ?: 'cinema_management';
    $db_port = getenv('DB_PORT') ?: 3306;
    $environment = getenv('ENVIRONMENT') ?: 'development';

    try {
        $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
        
        $pdo = new PDO(
            $dsn,
            $db_user,
            $db_password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 5,
            ]
        );
        
        // Set timezone for MySQL
        $pdo->exec("SET time_zone = '+00:00'");
        
        return $pdo;
    } catch (PDOException $e) {
        // Log error but don't expose sensitive info in production
        $error_message = ($environment === 'production') 
            ? 'Database connection failed' 
            : 'Database connection failed: ' . $e->getMessage();
        
        http_response_code(500);
        echo json_encode(['error' => $error_message]);
        exit();
    }
}