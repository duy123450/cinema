FROM php:8.1-apache

# Install required extensions
RUN docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy PHP backend
COPY backend/ .

# Install PHP dependencies
RUN composer install

# Build React frontend
COPY frontend/ /tmp/frontend
RUN cd /tmp/frontend && npm install && npm run build

# Copy built React app to Apache root
RUN cp -r /tmp/frontend/dist/* /var/www/html/

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]