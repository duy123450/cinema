# Stage 1 — Build frontend
FROM node:18 AS build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Stage 2 — Run PHP backend and serve built frontend
FROM php:8.2-apache
WORKDIR /var/www/html

# Copy backend files
COPY server/ .

# Copy built frontend files into public web root
COPY --from=build /app/client/dist ./client

# Enable Apache rewrite module (useful for React routing)
RUN a2enmod rewrite

# Expose port
EXPOSE 80

CMD ["apache2-foreground"]
