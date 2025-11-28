# Grupo 6 - Acuña Sergio, Burgos Nicolás, Elías Jarma, Silva Jael y Toro Agustín
# Estructura de Seguridad del Proyecto Gestión Canchas HIA

Este documento describe el flujo y la arquitectura de seguridad implementada en el proyecto, desde el acceso externo (ngrok) hasta la protección interna de los servicios (frontend, backend, mantis, etc.), detallando el rol de cada componente: WAF, Fail2Ban y el firewall del sistema operativo.

---

## 1. Acceso Externo: ngrok

- **ngrok** expone de forma segura servicios locales a Internet mediante túneles cifrados.
- Permite pruebas externas y acceso remoto sin exponer directamente la IP pública del servidor.
- El tráfico externo llega a la URL pública de ngrok y es redirigido al puerto seguro del WAF (443/8443).

## 2. WAF (Web Application Firewall)

- Implementado con **OWASP ModSecurity CRS** sobre Nginx (contenedor `waf`).
- Filtra y protege todo el tráfico HTTP/HTTPS antes de llegar a los servicios internos.
- Funciones principales:
  - **Reglas personalizadas y CRS**: Bloqueo de ataques comunes (SQLi, XSS, RCE, bots, path traversal, etc.).
  - **Rate limiting**: Limita la cantidad de peticiones por IP y por endpoint (por ejemplo, login y API general).
  - **Proxy seguro**: Redirige el tráfico a los servicios internos (backend, frontend, mantis, mongo-express, etc.).
  - **Logging detallado**: Registra accesos y errores en `/var/log/nginx/detailed-access.log` y `/var/log/nginx/error.log` para análisis y monitoreo.

## 3. Fail2Ban

- Ejecuta en un contenedor dedicado (`fail2ban`).
- Monitorea los logs generados por el WAF (Nginx) montados en modo solo lectura.
- Funciones principales:
  - **Jails personalizadas**: Detecta patrones de abuso (fuerza bruta, bots, DDoS, errores 4xx, etc.) definidos en `security/fail2ban/jail.d/custom.conf`.
  - **Baneo automático**: Al detectar un patrón malicioso, bloquea la IP ofensora durante un tiempo configurable.
  - **Integración con el firewall**: Aplica reglas de bloqueo a nivel de red en el host.

## 4. Firewall del Sistema Operativo (Windows)

- Reglas gestionadas mediante PowerShell (`security/firewall/setup_docker_firewall.ps1`).
- Funciones principales:
  - **Permitir solo tráfico necesario**: Solo se permiten conexiones a puertos internos desde la red de Docker o localhost.
  - **Bloqueo por defecto**: Todo el tráfico externo a puertos sensibles (MongoDB, Redis, Backend) está bloqueado salvo excepciones explícitas.
  - **Refuerzo de seguridad**: Si Fail2Ban detecta una IP maliciosa, el firewall bloquea su acceso a todos los servicios.

## 5. Servicios Internos

- **Frontend**: Aplicación Angular servida detrás del WAF.
- **Backend**: API Node.js/Express, solo accesible a través del WAF.
- **MantisBT**: Sistema de incidencias, accesible solo por el WAF.
- **Mongo Express**: Cliente visual de MongoDB, protegido por el WAF y Fail2Ban.
- **Otros servicios**: Todos los servicios internos están aislados y no exponen puertos directamente al exterior.

---
## Flujo de Seguridad (Resumen)

1. **Usuario externo** accede vía URL de ngrok.
2. **ngrok** reenvía el tráfico al puerto seguro del WAF.
3. **WAF** inspecciona, filtra y registra el tráfico, aplicando reglas de seguridad y limitaciones.
4. **Fail2Ban** analiza los logs del WAF y, si detecta patrones maliciosos, banea la IP ofensora.
5. **Firewall** del host refuerza el bloqueo de IPs y restringe el acceso a puertos internos.
6. Solo el tráfico legítimo llega a los **servicios internos** (frontend, backend, mantis, etc.).

---
## Resultados de Pruebas de Seguridad (Fail2Ban)

Se realizó una prueba automatizada utilizando el script `security/tests/prueba-de-seguridad.py` para verificar la efectividad de las reglas de Fail2Ban y la integración con el WAF. Las reglas para mitigación de bots y waf no se incluyeron. A continuación se muestra un resumen de los resultados obtenidos:

| Jail                      | Total Fallos | Actualmente Baneados | Total Baneados | Log Monitoreado                        | IPs Baneadas   |
|---------------------------|--------------|----------------------|---------------|----------------------------------------|---------------|
| **nginx-4xx**             | 12           | 1                    | 1             | /var/log/nginx/detailed-access.log     | 172.21.0.1    |
| **nginx-badbots**         | 0            | 0                    | 0             | /var/log/nginx/detailed-access.log     | -             |
| **nginx-botsearch**       | 0            | 0                    | 0             | /var/log/nginx/detailed-access.log     | -             |
| **nginx-ddos**            | 164          | 1                    | 1             | /var/log/nginx/detailed-access.log     | 172.21.0.1    |
| **nginx-limit-req**       | 4            | 1                    | 1             | /var/log/nginx/error.log               | 172.21.0.1    |
| **nginx-login-bruteforce**| 12           | 1                    | 1             | /var/log/nginx/detailed-access.log     | 172.21.0.1    |
| **nginx-modsecurity**     | 0            | 0                    | 0             | /var/log/nginx/error.log               | -             |
| **nginx-noscript**        | 246          | 1                    | 1             | /var/log/nginx/detailed-access.log     | 172.21.0.1    |

### Explicación de los resultados

- **nginx-4xx**: Detectó múltiples respuestas 4xx (errores de cliente) y baneó la IP tras superar el umbral configurado.
- **nginx-badbots / nginx-botsearch**: No se detectaron bots ni patrones de escaneo en esta prueba.
- **nginx-ddos**: Detectó un alto número de peticiones en poco tiempo (simulación de DDoS) y baneó la IP atacante.
- **nginx-limit-req**: Se superó el límite de peticiones permitidas en endpoints protegidos, resultando en baneo.
- **nginx-login-bruteforce**: Se simularon intentos de login fallidos y la IP fue baneada correctamente.
- **nginx-modsecurity**: No se detectaron eventos de ModSecurity en esta prueba específica.
- **nginx-noscript**: Detectó y baneó intentos de acceso a scripts no permitidos.

**Conclusión:**

Las jails activas detectaron y banearon correctamente la IP ofensora (172.21.0.1) tras superar los umbrales configurados, demostrando que Fail2Ban y el WAF están funcionando y aplicando baneos automáticos según lo esperado.

Para más detalles, consulta el script de prueba y el archivo `logs.md`.

---
## Archivos y rutas relevantes

- `security/waf/default.conf.template` y `custom-rules.conf`: Configuración y reglas del WAF.
- `security/fail2ban/jail.d/custom.conf`: Jails y filtros personalizados de Fail2Ban.
- `security/firewall/setup_docker_firewall.ps1`: Script para configurar reglas de firewall en Windows.
- `logs/nginx/`: Carpeta de logs monitoreada por Fail2Ban.
- `docker-compose.yml`: Orquestación de todos los servicios y redes.

---
## Recomendaciones

- Mantén actualizadas las reglas del WAF y Fail2Ban.
- Revisa periódicamente los logs y los baneos automáticos.
- No expongas puertos de servicios internos directamente.
- Usa ngrok solo para pruebas o acceso temporal.
