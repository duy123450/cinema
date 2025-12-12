<?php
// SMTP Configuration - Load from environment variables
// DO NOT commit credentials to git!
// Set these in .env file:
// MAIL_HOST=smtp.gmail.com
// MAIL_USERNAME=your-email@gmail.com
// MAIL_PASSWORD=your-app-password
// MAIL_PORT=587
// MAIL_SENDER_NAME=Cinema Team

define('MAIL_HOST', getenv('MAIL_HOST') ?: 'smtp.gmail.com');
define('MAIL_USERNAME', getenv('MAIL_USERNAME') ?: '');
define('MAIL_PASSWORD', getenv('MAIL_PASSWORD') ?: '');
define('MAIL_PORT', getenv('MAIL_PORT') ?: 587);
define('MAIL_SENDER_NAME', getenv('MAIL_SENDER_NAME') ?: 'Cinema Team');
