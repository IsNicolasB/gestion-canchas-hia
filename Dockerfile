FROM xlrl/mantisbt:latest

# Copiar configuración personalizada
COPY config/config_inc.php /var/www/html/config/config_inc.php

# Permisos correctos
RUN chown -R www-data:www-data /var/www/html/config

# Configurar Apache para pasar variables de entorno a PHP
RUN echo "PassEnv MANTIS_DB_HOST" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MANTIS_DB_PORT" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MANTIS_DB_NAME" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MANTIS_DB_USER" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MANTIS_DB_PASSWORD" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MANTIS_CRYPTO_MASTER_SALT" >> /etc/apache2/apache2.conf && \
    echo "PassEnv MANTIS_TIMEZONE" >> /etc/apache2/apache2.conf && \
    echo "PassEnv SMTP_USER" >> /etc/apache2/apache2.conf && \
    echo "PassEnv SMTP_PASS" >> /etc/apache2/apache2.conf && \
    echo "PassEnv SMTP_HOST" >> /etc/apache2/apache2.conf && \
    echo "PassEnv SMTP_PORT" >> /etc/apache2/apache2.conf && \
    echo "PassEnv SMTP_MODE" >> /etc/apache2/apache2.conf && \
    echo "PassEnv SMTP_FROM" >> /etc/apache2/apache2.conf && \
    echo "PassEnv APP_URL" >> /etc/apache2/apache2.conf 


# Exponer puerto
EXPOSE 80

# Comando por defecto
CMD ["apache2-foreground"]