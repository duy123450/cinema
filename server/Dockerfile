# Stage 1: Build frontend
FROM node:22 AS build
WORKDIR /app
COPY client/package*.json ./client/
RUN npm install --prefix client
COPY client/ ./client/
RUN npm run build --prefix client

# Stage 2: Serve with Apache + PHP
FROM php:8.2-apache
WORKDIR /var/www/html

# Copy built frontend into web root
COPY --from=build /app/client/ ./client/

# Optional: Copy backend files if you have them
COPY . /var/www/html/

# Enable mod_rewrite for SPA routing
RUN a2enmod rewrite

EXPOSE 80

CMD ["apache2-foreground"]