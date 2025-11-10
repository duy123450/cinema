# Use PHP 8.2 with Apache
FROM php:8.2-apache

# Enable mod_rewrite (for clean URLs / SPA fallback if needed)
RUN a2enmod rewrite

# Copy all files from server/ into Apache's web root
COPY . /var/www/html/

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"]