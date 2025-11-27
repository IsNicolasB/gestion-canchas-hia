# Reglas Fail2Ban para Nginx

Este documento describe las reglas personalizadas de Fail2Ban utilizadas para proteger el entorno Nginx de Gestión Canchas HIA. Cada jail está diseñada para detectar y bloquear patrones de comportamiento malicioso o sospechoso en los logs de Nginx.

---

## Jails configuradas

### 1. nginx-4xx
- **Propósito:** Bloquea IPs que generan múltiples errores 4xx (errores de cliente).
- **Filtro:** `nginx-4xx`
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 10
- **maxmatches:** 10
- **findtime:** 600s
- **bantime:** 3600s

### 2. nginx-badbots
- **Propósito:** Bloquea IPs que usan herramientas de escaneo o bots maliciosos (sqlmap, nikto, nmap, masscan, nessus).
- **Filtro:** `nginx-badbots`
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 1
- **maxmatches:** 1
- **findtime:** 600s
- **bantime:** 86400s (1 día)

### 3. nginx-botsearch
- **Propósito:** Bloquea bots de motores de búsqueda y crawlers agresivos (AhrefsBot, SemrushBot, etc.).
- **Filtro:** `nginx-botsearch`
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 1
- **findtime:** 600s
- **bantime:** 86400s (1 día)

### 4. nginx-ddos
- **Propósito:** Detecta posibles ataques DDoS por múltiples peticiones exitosas (200) en poco tiempo.
- **Filtro:** `nginx-ddos`
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 50
- **findtime:** 60s
- **bantime:** 86400s (1 día)

### 5. nginx-limit-req
- **Propósito:** Bloquea IPs que exceden los límites de peticiones configurados en Nginx (limit_req zone).
- **Filtro:** `nginx-limit-req`
- **Log:** `/var/log/nginx/error.log`
- **maxretry:** 3
- **findtime:** 300s
- **bantime:** 1800s (30 min)

### 6. nginx-login-bruteforce
- **Propósito:** Bloquea intentos de fuerza bruta en el endpoint de login.
- **Filtro:** `nginx-login-bruteforce`
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 5
- **findtime:** 300s
- **bantime:** 3600s (1 hora)

### 7. nginx-noscript
- **Propósito:** Bloquea intentos de acceso a rutas no válidas o scripts no existentes.
- **Filtro:** `nginx-noscript`
- **Log:** `/var/log/nginx/access.log`
- **maxretry:** 5
- **findtime:** 600s
- **bantime:** 3600s (1 hora)

---

## Filtros personalizados

Cada jail utiliza un filtro ubicado en `security/fail2ban/filter.d/` que define el patrón de log a buscar:

- **nginx-4xx.conf:** Errores 4xx
- **nginx-badbots.conf:** Bots y herramientas de escaneo
- **nginx-botsearch.conf:** Bots de motores de búsqueda
- **nginx-ddos.conf:** Peticiones 200 masivas
- **nginx-limit-req.conf:** Exceso de peticiones según limit_req
- **nginx-login-bruteforce.conf:** Fuerza bruta en login
- **nginx-noscript.conf:** Acceso a rutas no válidas

---

## Notas
- Todos los logs analizados corresponden a `/var/log/nginx/access.log` o `/var/log/nginx/error.log`.
- Los valores de `maxretry`, `findtime` y `bantime` pueden ajustarse según la sensibilidad deseada.
- Estas reglas ayudan a mitigar ataques automatizados, fuerza bruta, bots y abusos de recursos.

---

**Última actualización:** 26 de noviembre de 2025
