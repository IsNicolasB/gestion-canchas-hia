# Reglas personalizadas de Fail2Ban

Este archivo documenta las reglas personalizadas configuradas en `security/fail2ban/jail.d/custom.conf` para proteger el entorno mediante Fail2Ban y Nginx.

## Reglas configuradas

### [nginx-4xx]
- **Descripción:** Protege contra múltiples respuestas 4xx (errores de cliente) en Nginx.
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 10
- **findtime:** 600 segundos (10 minutos)
- **bantime:** 3600 segundos (1 hora)

### [nginx-badbots]
- **Descripción:** Bloquea bots maliciosos detectados por el filtro `nginx-badbots`.
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 1
- **findtime:** 600 segundos (10 minutos)
- **bantime:** 86400 segundos (1 día)

### [nginx-botsearch]
- **Descripción:** Bloquea intentos de escaneo de bots.
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 1
- **findtime:** 600 segundos (10 minutos)
- **bantime:** 86400 segundos (1 día)

### [nginx-ddos]
- **Descripción:** Protege contra ataques de denegación de servicio (DDoS) detectando un alto número de peticiones.
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 50
- **findtime:** 60 segundos (1 minuto)
- **bantime:** 86400 segundos (1 día)

### [nginx-limit-req]
- **Descripción:** Limita la cantidad de peticiones permitidas en un periodo corto, útil para evitar abusos.
- **Log:** `/var/log/nginx/error.log`
- **maxretry:** 3
- **findtime:** 300 segundos (5 minutos)
- **bantime:** 1800 segundos (30 minutos)

### [nginx-login-bruteforce]
- **Descripción:** Previene ataques de fuerza bruta en formularios de login.
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 5
- **findtime:** 300 segundos (5 minutos)
- **bantime:** 3600 segundos (1 hora)

### [nginx-noscript]
- **Descripción:** Bloquea intentos de acceso a scripts no permitidos.
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 5
- **findtime:** 600 segundos (10 minutos)
- **bantime:** 3600 segundos (1 hora)

### [nginx-modsecurity]
- **Descripción:** Bloquea eventos detectados por ModSecurity en Nginx.
- **Log:** `/var/log/nginx/error.log`
- **maxretry:** 3
- **findtime:** 600 segundos (10 minutos)
- **bantime:** 3600 segundos (1 hora)

---

**Notas:**
- Cada sección define una "jail" de Fail2Ban específica para distintos patrones de ataque o abuso.
- Los filtros (`filter = ...`) deben estar definidos en los archivos de filtros de Fail2Ban.
- Los parámetros `maxretry`, `findtime` y `bantime` determinan la sensibilidad y duración del baneo.
- Asegúrate de que los logs de Nginx estén correctamente configurados y accesibles para Fail2Ban.
