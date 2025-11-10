FROM php:8.2-apache

# Copy built frontend into Apache's web root
COPY --from=build /app/client/ /var/www/html/

# Optional: Copy backend files too (if you have them)
# COPY . /var/www/html/

# Enable mod_rewrite for SPA routing
RUN a2enmod rewrite

EXPOSE 80

CMD ["apache2-foreground"]