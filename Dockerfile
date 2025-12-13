FROM php:8.1-apache

# Install required extensions including MySQL
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy PHP backend
COPY server/ .

# Copy environment file
COPY .env.production .env

# Install PHP dependencies
RUN composer install

# Build React frontend
COPY client/ /tmp/frontend
RUN cd /tmp/frontend && npm install && npm run build

# Copy built React app to Apache root
RUN cp -r /tmp/frontend/dist/* /var/www/html/

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]