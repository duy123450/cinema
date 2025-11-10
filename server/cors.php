<?php
// // server/cors.php

// // Allow only your frontend origin (no trailing spaces!)
// header("Access-Control-Allow-Origin: https://cinema-frontend.onrender.com");

// // Allowed methods
// header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// // Allowed headers (important for JSON requests, auth, etc.)
// header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// // Optional: cache preflight response for 1 day (reduces OPTIONS requests)
// header("Access-Control-Max-Age: 86400");

// // Handle preflight requests
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     http_response_code(204); // No Content
//     exit();
// }
