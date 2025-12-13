FROM php:8.1-apache

# Install required extensions
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# --- BACKEND SETUP (Tất cả đều vào root /var/www/html) ---

# 1. Copy composer.json từ server/ vào root
COPY server/composer.json .

# 3. Copy phần còn lại của PHP backend (api/, config/, index.php, etc.) vào root
COPY server/ .

# 4. Install PHP dependencies (Bây giờ composer.json đã có mặt tại .)
RUN composer install

# --- FRONTEND BUILD & COPY ---

# Build React frontend
COPY client/ /tmp/client
RUN cd /tmp/client && npm install && npm run build

# Copy built React app to Apache root (Ghi đè lên các tệp PHP không cần thiết)
RUN cp -r /tmp/client/dist/* /var/www/html/

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]