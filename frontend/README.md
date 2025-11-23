# Football

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Configuración de Docker y Despliegue

Esta documentación resume el proceso de configuración de Docker, nginx y la integración de frontend (Angular) y backend (Node.js/Express) para el proyecto `gestion-canchas-hia`. Se cubre desde la configuración inicial hasta la resolución de problemas y el despliegue local.

### Resumen del Avance
- **Objetivo inicial**: Crear un despliegue general que integre backend y frontend en una sola imagen Docker, luego separar para desarrollo independiente.
- **Problemas resueltos**: Errores 404 en archivos estáticos de Angular, proxy de APIs, y configuración de nginx.
- **Resultado**: Frontend sirviendo en `http://localhost:8080` con nginx, proxyeando `/api/` al backend local en `localhost:3000`. Backend y MongoDB en Docker Compose general.

### Configuración General
- **Entorno**: Windows con Docker Desktop, VS Code.
- **Herramientas**: Docker Compose, nginx:alpine, Node.js 18.
- **Estructura del proyecto**:
  - `frontend/`: Aplicación Angular.
  - `backend/`: API Node.js/Express con MongoDB.
  - Raíz: Docker Compose general para infraestructura completa.

### Archivos Modificados y Configurados

#### 1. Docker Compose General (Raíz)
Archivo: `docker-compose.yml`
- Incluye servicios para MongoDB (primario y réplica), backend, frontend (nginx) y Mongo Express.
- Frontend expone puerto 80, backend interno, Mongo Express en 8081.
- Comando para ejecutar: `docker compose up --build -d`.

#### 2. Docker Compose para Frontend (Desarrollo Independiente)
Archivo: `frontend/docker-compose.yml`
- Usa Dockerfile de producción con nginx.
- Expone puerto 8080.
- Proxyea `/api/` a `http://host.docker.internal:3000/` (backend local).
- Comando: `docker compose up --build` (desde `frontend/`).

#### 3. Dockerfile del Frontend
Archivo: `frontend/Dockerfile`
- Multi-stage: Build con Node.js, luego nginx:alpine.
- Build de producción: `RUN npm run build`.
- Copia archivos de `dist/football/browser` a `/usr/share/nginx/html`.
- Verificaciones temporales: `RUN ls -la` para diagnosticar.
- Expone puerto 80.

#### 4. Configuración de nginx
Archivo: `frontend/nginx-custom.conf`
- Servidor en puerto 80.
- Root: `/usr/share/nginx/html`.
- `location /`: Sirve SPA con `try_files $uri $uri/ /index.html` (para rutas de Angular).
- `location /api/`: Proxy a backend local (`http://host.docker.internal:3000/`).

#### 5. Configuración de Angular
- `angular.json`: Output path `dist/football`.
- `environment.prod.ts`: `apiUrl: '/api/'` para llamadas relativas.
- Build: Producción para optimización.

#### 6. Backend
- Servidor en puerto 3000. SIN CORS
- Rutas API en `/api/*`.
- Conexión a MongoDB (configurada en Docker Compose).

### Problemas Resueltos
- **Proxy de APIs**: Configurado en nginx para redirigir `/api/` al backend.
- **Build sin caché**: Usar `--no-cache` en Docker Compose para forzar reconstrucción.
- **Modo desarrollo vs producción**: Cambiado a producción para assets optimizados.

### Cómo Usar
1. **Desarrollo independiente**:
   - Corre backend local: `npm start` en `backend/` (puerto 3000).
   - En `frontend/`: `docker compose up --build`.
   - Accede: `http://localhost:8080`.

2. **Infraestructura completa**:
   - En raíz: `docker compose up --build -d`.
   - Frontend: `http://localhost`.
   - Backend APIs: `http://localhost:3000/api/`.
   - Mongo Express: `http://localhost:8081`.

3. **Reconstruir sin caché**: `docker compose build --no-cache && docker compose up`.

### Notas Adicionales
- Asegura que el backend esté corriendo en `localhost:3000` para el proxy.
- Para producción, empuja imágenes a Docker Hub con workflows de GitHub Actions (ya configurados en `.github/workflows/`).
- Si hay cambios en código, reconstruye imágenes.
- Logs: `docker compose logs [servicio]` para debugging.

Esta configuración permite desarrollo eficiente y despliegue escalable. Si necesitas expansiones (ej. HTTPS, despliegue en nube), avisa.
