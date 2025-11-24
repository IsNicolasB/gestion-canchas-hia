FROM nextcloud:28-apache

# Instalar: driver PostgreSQL
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 80

CMD ["apache2-foreground"]
