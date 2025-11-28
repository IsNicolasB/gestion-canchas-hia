# gestion-canchas-hia

## Descripción general

Este proyecto es una plataforma integral para la gestión de canchas, reservas, usuarios y administración de turnos, con enfoque a reserva de canchas de futbol. Incluye:

- Backend Node.js/Express con MongoDB y Redis
- Frontend Angular
- Sistema de incidencias (MantisBT)
- Almacenamiento de archivos colaborativo (Nextcloud)
- Seguridad y monitoreo: WAF (ModSecurity), Fail2Ban, PMM (Percona Monitoring & Management)
- Backups automáticos y cliente visual para MongoDB

## Arquitectura de contenedores

El despliegue utiliza Docker Compose y está compuesto por los siguientes servicios principales:

- **mongo-primary, mongo-secondary1, mongo-secondary2**: Replica set de MongoDB para alta disponibilidad y tolerancia a fallos.
- **mongo-setup**: Inicializa el replica set y usuarios de MongoDB.
- **backend**: API REST principal (Node.js/Express) conectada a MongoDB y Redis.
- **frontend**: Aplicación Angular, servida internamente.
- **redis**: Cache y almacenamiento de sesiones.
- **mongo-express**: Cliente web para administración visual de MongoDB.
- **waf**: Firewall de aplicaciones web (ModSecurity CRS sobre Nginx) que protege y enruta el tráfico HTTPS a los servicios internos.
- **fail2ban**: Bloqueo automático de IPs maliciosas basado en logs del WAF.
- **pmm-server**: Monitoreo avanzado de bases de datos y servidores.
- **mantisbt, mantis_db**: Sistema de tickets/incidencias y su base de datos PostgreSQL.
- **nextcloud, nextcloud_db**: Almacenamiento colaborativo de archivos y base de datos PostgreSQL.
- **mongo_backup**: Servicio de backups automáticos de MongoDB.

## Funcionamiento del despliegue

1. **Variables de entorno**: Configura el archivo `.env` en la raíz con los parámetros necesarios (usuarios, contraseñas, SMTP, etc.).
2. **Levantamiento de servicios**: Ejecuta:
	```sh
	docker compose up -d
	```
	Esto inicia todos los servicios, redes y volúmenes necesarios.
3. **Acceso a servicios**:
	- El WAF expone el puerto 443 (HTTPS) y enruta:
	  - `/` → Frontend Angular
	  - `/api/` → Backend Node.js
	  - `/mantis/` → MantisBT
	  - `/nextcloud/` → Nextcloud
	  - `/express/` → Mongo Express
	- PMM está disponible en el puerto 8082.
	- Nextcloud en el puerto 8084 (solo para pruebas/directo).
	- Mongo Express en el puerto 8081 (solo para pruebas/directo).
4. **Persistencia**: Todos los datos críticos (bases de datos, archivos, logs) se almacenan en volúmenes Docker.
5. **Backups**: El servicio `mongo_backup` ejecuta scripts automáticos y programados para respaldar la base de datos MongoDB.

## Seguridad y monitoreo

- El WAF filtra y protege todo el tráfico externo.
- Fail2Ban bloquea IPs sospechosas según los logs del WAF.
- PMM permite monitoreo y métricas de bases de datos y servidores.

## Configuración de firewall (Windows)

Para reforzar la seguridad en entornos Windows, se provee el script `security/firewall/setup_docker_firewall.ps1` que crea reglas de firewall para restringir el acceso a los servicios internos expuestos por Docker:

- **MongoDB (puerto 27017):**
	- Bloquea todo el tráfico externo.
	- Permite solo conexiones desde la red interna de Docker.
- **Redis (puerto 6379):**
	- Bloquea todo el tráfico externo.
	- Permite solo conexiones desde localhost.
- **Backend (puerto 3000):**
	- Bloquea todo el tráfico externo.
	- Permite solo conexiones desde localhost.

### Uso del script

1. Abre PowerShell como administrador.
2. Ejecuta:
	 ```powershell
	 cd security/firewall
	 ./setup_docker_firewall.ps1
	 ```
3. El script detecta la red de Docker y aplica las reglas automáticamente.

Esto ayuda a evitar accesos no autorizados a los servicios internos desde fuera del host o de la red Docker.

---

- El sistema está preparado para entornos productivos y de desarrollo.
- La configuración de cada servicio puede personalizarse mediante variables de entorno y archivos de configuración montados.
- Para detalles específicos de cada módulo (MantisBT, Nextcloud, backend, etc.), revisa los respectivos directorios y archivos README.