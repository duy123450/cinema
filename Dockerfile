FROM php:8.1-apache

# CÀI ĐẶT CÁC CÔNG CỤ CẦN THIẾT CHO COMPOSER (zip, unzip, git)
RUN apt-get update && \
    apt-get install -y \
    git \
    zip \
    unzip \
    # Clean up APT files
    && rm -rf /var/lib/apt/lists/*

# Install required extensions
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# --- BACKEND SETUP ---

# 1. Copy composer.json từ server/ vào root
COPY server/composer.json .

# 2. Copy phần còn lại của PHP backend (api/, config/, index.php, etc.) vào root
COPY server/ .

# 3. Install PHP dependencies
RUN composer install

# --- FRONTEND BUILD & COPY ---

# Build React frontend
COPY client/ /tmp/client
RUN cd /tmp/client && npm install && npm run build

# Copy built React app to Apache root
RUN cp -r /tmp/client/dist/* /var/www/html/

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]