# gestion-tickets

## Despliegue y configuración de MantisBT

El sistema de seguimiento de incidencias [MantisBT](https://www.mantisbt.org/) está integrado en este entorno mediante Docker Compose, utilizando una base de datos PostgreSQL y variables de entorno para su configuración.

### Arquitectura

- **Contenedor `mantisbt`**: Ejecuta la aplicación web de MantisBT.
- **Contenedor `mantis_db`**: Base de datos PostgreSQL dedicada a MantisBT.
- Ambos servicios están conectados a la red interna `mantis_network` y también a `mongo-cluster` para facilitar la administración y monitoreo.
- El archivo de configuración principal es `mantisbt/config/config_inc.php`, que se monta en el contenedor como solo lectura.

### Configuración

La configuración de MantisBT se realiza principalmente a través de variables de entorno y el archivo `config_inc.php`:

- **Variables de entorno**: Se definen en el archivo `.env` en la raíz del proyecto y son referenciadas en el `docker-compose.yml`.
	- Ejemplo de variables:
	  - `MANTIS_DB_NAME`, `MANTIS_DB_USER`, `MANTIS_DB_PASS`: Configuración de la base de datos PostgreSQL.
	  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_MODE`: Configuración de correo SMTP para notificaciones.
	  - `APP_URL`: URL pública de la aplicación, utilizada para enlaces en correos.
- **Archivo `config_inc.php`**: Lee las variables de entorno y define parámetros como:
	- Conexión a la base de datos.
	- Zona horaria (`America/Argentina/Jujuy`).
	- Configuración de correo y notificaciones.
	- Seguridad y opciones de idioma.

### Despliegue

Para desplegar MantisBT:

1. Asegúrate de tener el archivo `.env` con las variables necesarias.
2. Ejecuta:
   ```sh
   docker compose up -d mantisbt mantis_db
   ```
3. El archivo de configuración se monta automáticamente y toma los valores del entorno.
4. El acceso a MantisBT se realiza a través del proxy WAF en la ruta `/mantis/` (por ejemplo, `https://jayme-subvesicular-paulene.ngrok-free.dev/mantis/`).

### Notas adicionales

- El contenedor de MantisBT está configurado para enviar correos usando SMTP seguro, y permite personalizar el remitente y otros parámetros desde el entorno.
- El acceso a la base de datos está restringido a la red interna de Docker.
- El archivo de configuración está preparado para entornos productivos y de desarrollo, permitiendo flexibilidad y seguridad.