# Arquitectura del Sistema - Gestión de Canchas HIA

**Fecha:** 27 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** Producción

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Diagrama de Arquitectura](#diagrama-de-arquitectura)
3. [Componentes del Sistema](#componentes-del-sistema)
4. [Flujos de Datos](#flujos-de-datos)
5. [Connection Pooling](#connection-pooling)
6. [Estrategia de Caché](#estrategia-de-caché)
7. [Alta Disponibilidad y Failover](#alta-disponibilidad-y-failover)
8. [Seguridad](#seguridad)
9. [Observabilidad](#observabilidad)
10. [Backups y Recuperación](#backups-y-recuperación)
11. [Servicios Auxiliares](#servicios-auxiliares)

---

## 🎯 Resumen Ejecutivo

Sistema web de gestión de canchas deportivas con arquitectura de microservicios distribuida, alta disponibilidad mediante MongoDB Replica Set, caché Redis para optimización de rendimiento, y múltiples capas de seguridad (WAF + Fail2Ban).

**Stack tecnológico:**
- **Frontend:** Angular 19 + Nginx
- **Backend:** Node.js 20 + Express
- **Base de datos:** MongoDB 7 (Replica Set)
- **Caché:** Redis 7 (AOF + LRU)
- **Seguridad:** ModSecurity WAF + OWASP CRS + Fail2Ban
- **Observabilidad:** Percona PMM
- **Gestión de Proyectos:** MantisBT 2.27.3 + PostgreSQL 17
- **Almacenamiento:** Nextcloud 28 + PostgreSQL 16
- **Orquestación:** Docker Compose

---

## 🏗️ Diagrama de Arquitectura

```mermaid
flowchart TB
  subgraph Edge_Seguridad[Edge Seguridad]
    CF[Cloudflare Tunnel]
    WAF[WAF 443]
    F2B[Fail2Ban]
  end
  subgraph Presentacion[Presentacion]
    FE[Frontend Nginx + Angular]
  end
  subgraph Aplicacion[Aplicacion]
    BE[Backend API Express]
  end
  subgraph Cache[CACHE]
    R[Redis]
  end
  subgraph BaseDeDatos[Replica Set rs0]
    MP[(mongo-primary)]
    MS1[(mongo-secondary1)]
    MS2[(mongo-secondary2)]
  end
  subgraph Inicializacion[Inicializacion]
    SETUP[mongo-setup]
  end
  subgraph Operaciones[Operaciones]
    BK[mongo_backup]
  end
  subgraph Observabilidad[Observabilidad]
    PMM[PMM]
    ME[Mongo Express dev]
  end
  subgraph Auxiliares[Servicios Auxiliares]
    MANTIS[MantisBT]
    MANTIS_DB[(PostgreSQL mantis_bt)]
    NC[Nextcloud]
    NC_DB[(PostgreSQL nextcloud)]
  end

  %% Conexiones con etiquetas explicativas
  U1[Web Browser] -->|Cliente HTTPS| CF
  U2[Mobile App] -->|Cliente HTTPS| CF
  CF -->|Entrada externa segura| WAF
  WAF -->|Ruta /  estaticos| FE
  WAF -->|Ruta /api REST| BE
  WAF -->|Ruta /mantis UI| MANTIS
  WAF -->|Ruta /cloud UI| NC
  WAF -->|Ruta /mongo-express dev| ME

  BE -->|Cache GET TTL| R
  BE -->|Driver MongoDB pool| MP
  MP -->|Replicación oplog| MS1
  MP -->|Replicación oplog| MS2
  SETUP -->|rs.initiate y usuarios| MP
  BK -->|mongodump diario| MP
  PMM -->|Métricas y profiler| MP
  PMM -->|Métricas y profiler| MS1
  PMM -->|Métricas y profiler| MS2
  ME -->|Admin DB dev| MP
  MANTIS -->|CRUD issues| MANTIS_DB
  NC -->|Archivos y metadatos| NC_DB

  %% Colores por capa
  classDef edge fill:#fee2e2,stroke:#dc2626,color:#7f1d1d,stroke-width:2px;
  classDef presentation fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,stroke-width:2px;
  classDef application fill:#d1fae5,stroke:#10b981,color:#064e3b,stroke-width:2px;
  classDef cache fill:#fef3c7,stroke:#f59e0b,color:#78350f,stroke-width:2px;
  classDef database fill:#e0e7ff,stroke:#6366f1,color:#312e81,stroke-width:2px;
  classDef operations fill:#f3e8ff,stroke:#a855f7,color:#581c87,stroke-width:2px;
  classDef monitoring fill:#fbcfe8,stroke:#ec4899,color:#831843,stroke-width:2px;
  classDef auxiliary fill:#fef9c3,stroke:#eab308,color:#713f12,stroke-width:2px;

  class CF,WAF,F2B edge;
  class FE presentation;
  class BE application;
  class R cache;
  class MP,MS1,MS2 database;
  class SETUP,BK operations;
  class PMM,ME monitoring;
  class MANTIS,MANTIS_DB,NC,NC_DB auxiliary;
```

Notas:
- Mantiene flujo principal sin estilos ni emojis.
- Nodos circulares para miembros del replica set.
- Puedes copiar solo este bloque en el editor Mermaid Live si el original no se renderiza.


---

## 🧩 Componentes del Sistema

### 1. Capa de Seguridad (Edge)

#### WAF (Web Application Firewall)
- **Imagen:** `owasp/modsecurity-crs:nginx-alpine`
- **Puerto expuesto:** `443:8443`
- **Función:** 
  - Terminación TLS/SSL
  - Inspección de tráfico HTTP/HTTPS
  - Bloqueo de ataques (SQLi, XSS, RFI, LFI)
  - Rate limiting y validación de anomalías
- **Configuración:**
  ```yaml
  PARANOIA: 1              # Nivel de detección
  BLOCKING_PARANOIA: 1     # Nivel de bloqueo
  ANOMALY_INBOUND: 20      # Umbral de anomalía entrada
  ANOMALY_OUTBOUND: 5      # Umbral de anomalía salida
  ```
 - **Enrutamiento por path (reverse proxy):**
   ```
   /                 -> Frontend (Nginx + Angular)
   /api              -> Backend (Express)
   /mantis           -> MantisBT
   /cloud (o /nextcloud) -> Nextcloud
   /mongo-express (dev)  -> Mongo Express (solo desarrollo)
   ```
 - **Conectividad externa:** Un único Cloudflare Tunnel termina en el WAF y desde allí se enruta por path a cada servicio.
- **Volúmenes:**
  - Certificados TLS (read-only)
  - Reglas personalizadas ModSecurity
  - Logs compartidos con Fail2Ban

#### Fail2Ban
- **Imagen:** `crazymax/fail2ban:latest`
- **Network mode:** `host` (para bloqueo efectivo de IPs)
- **Función:**
  - Análisis de logs de Nginx/WAF
  - Detección de patrones de ataque
  - Bloqueo automático de IPs (iptables)
- **Capacidades:** `NET_ADMIN`, `NET_RAW`
- **Nota:** Más efectivo en Linux nativo; en WSL puede tener limitaciones

---

### 2. Capa de Presentación

#### Frontend (Nginx + Angular)
- **Build:** Custom Dockerfile
- **Framework:** Angular 19 (standalone components)
- **Servidor:** Nginx Alpine
- **Puerto:** Interno (no expuesto públicamente)
- **Acceso:** Solo vía WAF
- **Función:**
  - Servir aplicación SPA
  - Assets estáticos (JS, CSS, imágenes)
  - Routing del lado cliente
- **Optimizaciones:**
  - Compresión gzip
  - Cache headers para assets
  - Lazy loading de módulos

---

### 3. Capa de Aplicación

#### Backend (Node.js + Express)
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Puerto:** `3000` (interno)
- **Funciones principales:**
  - API RESTful
  - Autenticación JWT
  - Integración con Mercado Pago
  - Envío de emails (recordatorios)
  - Middleware de caché con Redis
- **Variables de entorno:**
  ```bash
  MONGODB_URI=mongodb://devuser:devpass@mongo-primary:27017,mongo-secondary1:27017,mongo-secondary2:27017/mi_app_db?replicaSet=rs0&authSource=admin&retryWrites=true&w=majority
  NODE_ENV=production
  ```
- **Healthcheck:** Endpoint `/health` (a implementar)
- **Logging:** JSON logs a volumen compartido

---

### 4. Capa de Caché

#### Redis 7
- **Imagen:** `redis:7-alpine`
- **Puerto:** `6379` (interno, no exponer en producción)
- **Memoria:** 512 MB (límite configurable)
- **Persistencia:** AOF (Append Only File)
- **Política de evicción:** `allkeys-lru` (Least Recently Used)
- **Configuración:**
  ```bash
  --appendonly yes            # Persistencia AOF
  --maxmemory 512mb           # Límite de RAM
  --maxmemory-policy allkeys-lru
  --save 60 1000              # Snapshot cada 60s si 1000 writes
  ```
- **Healthcheck:** `redis-cli ping`
- **Uso:**
  - Caché de queries de MongoDB
  - TTL variable por endpoint (60s - 1800s)
  - Invalidación por patrones en operaciones de escritura

---

### 5. Capa de Datos

#### MongoDB Replica Set (rs0)

**Configuración del Replica Set:**
```javascript
{
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-primary:27017", priority: 2 },
    { _id: 1, host: "mongo-secondary1:27017", priority: 1 },
    { _id: 2, host: "mongo-secondary2:27017", priority: 1 }
  ]
}
```

##### mongo-primary
- **Rol:** Nodo primario preferido
- **Priority:** 2 (mayor que secundarios)
- **Recursos:**
  - RAM: 2-4 GB
  - CPUs: 1-2 cores
  - WiredTiger Cache: 2 GB
- **Puerto:** `27017`
- **Healthcheck:** `db.runCommand("ping")`
- **Función:**
  - Recibe todas las escrituras
  - Sirve lecturas (configurable)
  - Replica a secundarios

##### mongo-secondary1 y mongo-secondary2
- **Rol:** Nodos secundarios (réplicas)
- **Priority:** 1
- **Recursos:**
  - RAM: 1-2 GB
  - CPUs: 0.5-1 core
  - WiredTiger Cache: 1 GB
- **Puertos:** `27018`, `27019`
- **Función:**
  - Reciben replicación del primario
  - Pueden servir lecturas (con readPreference)
  - Elegibles como primario en failover

**Usuarios creados:**
- `devuser:devpass` - Role: `root` en `admin`
- `pmm:pmmpass` - Roles: monitoreo para PMM

**Profiling habilitado:**
```javascript
db.setProfilingLevel(2, { slowms: 100 });
```

---

### 6. Inicialización y Operaciones

#### mongo-setup
- **Imagen:** `mongo:latest`
- **Restart:** `no` (run-once)
- **Función:**
  1. Inicializar Replica Set con `rs.initiate()`
  2. Crear usuario admin (`devuser`)
  3. Crear usuario PMM (`pmm`)
  4. Habilitar profiling en `mi_app_db`
- **Idempotencia:** Maneja `AlreadyInitialized`
- **Dependencias:** Espera healthcheck de los 3 nodos

#### mongo_backup
- **Imagen:** `mongo:latest`
- **Restart:** `always`
- **Función:**
  - Ejecutar backups programados vía cron
  - Scripts de restore
  - Logs de operaciones
- **Volumen:** `./backup` montado en `/backup`
- **Cron:** Configurado desde `crontab.txt`
- **Zona horaria:** `America/Argentina/Jujuy`

---

### 7. Observabilidad

#### PMM Server (Percona Monitoring and Management)
- **Imagen:** `percona/pmm-server:2`
- **Puerto:** `8082:80`
- **Función:**
  - Monitoreo de métricas de MongoDB
  - Query Analytics (via profiler)
  - Dashboards Grafana
  - Alertas configurables
- **Volumen:** `pmm-server-data` persistente
- **Healthcheck:** `curl http://localhost/ping`

#### PMM Setup Manual
- **Perfil:** `manual` (no se levanta por defecto)
- **Función:**
  - Configurar pmm-admin con credenciales
  - Registrar los 3 nodos de MongoDB
  - Habilitar query source profiler
- **Ejecución:**
  ```bash
  docker compose --profile manual up pmm-setup-manual
  ```

#### Mongo Express
- **Puerto:** `8081:8081`
- **Credenciales:** `admin:password123`
- **Función:** UI web para administración de MongoDB
- **Recomendación:** Solo en desarrollo, no exponer en producción

---

## 🔄 Flujos de Datos

### Flujo de Lectura (GET)

```
1. Usuario → HTTPS → WAF (443)
2. WAF → Validación ModSecurity
3. WAF → Frontend (static) o Backend (API)
4. Backend → Verifica caché en Redis
   
   CACHE HIT:
   5a. Redis → Devuelve data (<1ms)
   6a. Backend → Response al usuario
   
   CACHE MISS:
   5b. Backend → Query a MongoDB (via Connection Pool)
   6b. MongoDB Primary/Secondary → Ejecuta query con índices
   7b. Backend → Guarda resultado en Redis (con TTL)
   8b. Backend → Response al usuario
```

**Tiempos típicos:**
- Cache HIT: < 1 ms
- Cache MISS con índices: 50-500 ms
- Cache MISS sin índices: 1000+ ms (optimizado en Fase D)

---

### Flujo de Escritura (POST/PUT/DELETE)

```
1. Usuario → HTTPS → WAF (443)
2. WAF → Validación ModSecurity
3. WAF → Backend API
4. Backend → Validación y autenticación
5. Backend → Write a MongoDB Primary
6. MongoDB Primary → Replica a Secondary1 y Secondary2
7. Backend → Confirma write concern (w:majority)
8. Backend → Invalida caché en Redis (por patrón)
   Ejemplo: invalidateCache('cache:/canchas*')
9. Backend → Response al usuario
```

**Write Concern:** `w:majority` garantiza que la escritura se confirmó en la mayoría de nodos antes de responder.

---

### Flujo de Failover (Caída del Primario)

```
1. mongo-primary se cae o pierde conectividad
2. Secondary1 y Secondary2 detectan ausencia (~10s)
3. Elección automática: uno de los secundarios se promueve a Primary
   - Priority 1 en ambos (el más actualizado gana)
4. Backend detecta cambio (driver de MongoDB)
5. Backend reconecta automáticamente al nuevo Primary
   - URI incluye múltiples hosts + replicaSet=rs0
6. Escrituras/lecturas continúan con nuevo Primary
7. Cuando mongo-primary regresa:
   - Se une como Secondary
   - Sincroniza datos faltantes
   - Puede recuperar rol Primary por priority (en próxima elección)
```

**Downtime típico:** 10-30 segundos durante elección.

---

## 🔌 Connection Pooling

### Configuración de Mongoose (Backend)

El backend usa Mongoose para conectarse a MongoDB. El driver mantiene un **pool de conexiones** reutilizables para evitar overhead de TCP handshake en cada request.

#### Parámetros recomendados:

```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const options = {
    // Connection pool
    maxPoolSize: 100,          // Máximo de conexiones simultáneas
    minPoolSize: 10,           // Mínimo de conexiones mantenidas abiertas
    
    // Timeouts
    serverSelectionTimeoutMS: 5000,   // Timeout para seleccionar servidor
    socketTimeoutMS: 45000,            // Timeout de socket inactivo
    connectTimeoutMS: 10000,           // Timeout de conexión inicial
    
    // Retry writes
    retryWrites: true,                 // Reintentar escrituras fallidas
    retryReads: true,                  // Reintentar lecturas fallidas
    
    // Write concern
    w: 'majority',                     // Confirmar en mayoría de nodos
    
    // Read preference
    readPreference: 'primaryPreferred', // Preferir primario, fallback a secundarios
    
    // Auth
    authSource: 'admin',
    
    // Replica set
    replicaSet: 'rs0',
    
    // Monitoring
    monitorCommands: process.env.NODE_ENV === 'development',
  };
  
  await mongoose.connect(process.env.MONGODB_URI, options);
  
  console.log('✅ MongoDB conectado con connection pool');
  console.log(`📊 Pool size: ${options.maxPoolSize} conexiones máximas`);
};

module.exports = connectDB;
```

#### Cómo funciona el pool:

1. **Inicialización:** Al arrancar el backend, Mongoose crea `minPoolSize` conexiones abiertas.
2. **Bajo demanda:** Si llegan más requests simultáneos, el pool crece hasta `maxPoolSize`.
3. **Reutilización:** Conexiones se reutilizan entre requests (no se cierran).
4. **Idle timeout:** Conexiones inactivas eventualmente se cierran (pero mantiene mínimo).
5. **Failover:** Si un nodo cae, el pool redirige conexiones a nodos disponibles.

#### Beneficios:

- **Latencia reducida:** No hay TCP handshake por request (~50-100ms ahorrados).
- **Throughput alto:** Soporta cientos de requests concurrentes.
- **Resilencia:** Maneja reconexiones automáticas en failover.

#### Ajuste según carga:

| Carga esperada | maxPoolSize | minPoolSize | Notas |
|----------------|-------------|-------------|-------|
| Baja (<50 users) | 20-50 | 5 | Suficiente para demo/dev |
| Media (50-200 users) | 50-100 | 10 | Configuración actual |
| Alta (200-500 users) | 100-200 | 20 | Requiere más RAM en MongoDB |
| Muy alta (500+ users) | 200-500 | 50 | Considerar sharding |

**Regla general:** `maxPoolSize` ≈ número de requests concurrentes esperados × 1.2

---

## ⚡ Estrategia de Caché

### Arquitectura de Caché con Redis

#### Middleware de Caché (`cacheMiddleware.js`)

```javascript
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Solo cachear GET
    if (req.method !== 'GET') return next();
    
    // Generar clave única
    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `cache:${req.originalUrl}`;
    
    // Buscar en Redis
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      // CACHE HIT
      return res.json({
        ...JSON.parse(cachedData),
        _cached: true,
        _cacheKey: cacheKey
      });
    }
    
    // CACHE MISS - interceptar response
    const originalSend = res.json;
    res.json = function(data) {
      // Guardar en Redis con TTL
      redis.setex(cacheKey, ttl, JSON.stringify(data));
      
      // Enviar respuesta original
      originalSend.call(this, {
        ...data,
        _cached: false,
        _cacheKey: cacheKey
      });
    };
    
    next();
  };
};
```

#### TTL por Endpoint

| Endpoint | TTL | Justificación |
|----------|-----|---------------|
| `GET /canchas` | 1800s (30min) | Datos estáticos, cambian raramente |
| `GET /canchas/:id` | 600s (10min) | Detalle de cancha, actualización ocasional |
| `GET /clientes` | 60s (1min) | Listado completo, cambios frecuentes |
| `GET /clientes/:id` | 300s (5min) | Perfil de cliente, cambios moderados |
| `GET /reservas` | 120s (2min) | Listado de reservas, alta rotación |
| `GET /horarios/filtrar` | 60s (1min) | Disponibilidad en tiempo real |

#### Invalidación de Caché

**Estrategia:** Al modificar datos (POST/PUT/DELETE), invalidar por patrón.

```javascript
// CanchaController.js - crearCancha()
await Cancha.save();
await invalidateCache('cache:/canchas*'); // Invalida todas las claves de canchas

// ReservaController.js - crearReserva()
await Reserva.save();
await invalidateCache('cache:/reservas*');
await invalidateCache('cache:/horarios*'); // Horarios cambian con nueva reserva
```

**Función de invalidación:**
```javascript
const invalidateCache = async (pattern) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`🗑️ Cache invalidado: ${keys.length} claves (patrón: ${pattern})`);
  }
};
```

#### Métricas de Caché

**Comandos útiles:**
```bash
# Hit rate
docker compose exec redis redis-cli INFO stats | grep keyspace

# Memoria usada
docker compose exec redis redis-cli INFO memory | grep used_memory_human

# Ver claves cacheadas
docker compose exec redis redis-cli KEYS "cache:*"

# Ver contenido de una clave
docker compose exec redis redis-cli GET "cache:/canchas"
```

**Objetivo:** Hit rate > 60% en endpoints frecuentes.

---

## 🚀 Alta Disponibilidad y Failover

### Componentes de HA

1. **MongoDB Replica Set:**
   - 1 primario + 2 secundarios
   - Elección automática en < 30s
   - Write concern `w:majority`

2. **Redis:**
   - Persistencia AOF (recuperación post-restart)
   - Consideración futura: Redis Sentinel para HA

3. **Backend:**
   - Stateless (puede escalar horizontalmente)
   - Reconexión automática a MongoDB

4. **Frontend:**
   - SPA servida por Nginx
   - Puede replicarse detrás del WAF

### Escenarios de Fallo

#### Caída de mongo-primary
- **Detección:** ~10 segundos
- **Elección:** ~10-20 segundos
- **Impacto:** Requests fallidos durante ~30s, luego normalización
- **Recuperación:** Automática

#### Caída de Redis
- **Impacto:** Backend continúa (degradación graceful)
- **Comportamiento:** Todas las queries van directo a MongoDB
- **Latencia:** Incremento de 50-500ms por request
- **Recuperación:** Al reiniciar Redis, se reconstruye caché

#### Caída de Backend
- **Impacto:** API no disponible
- **Solución:** Desplegar múltiples instancias de backend detrás de load balancer
- **Consideración futura:** Kubernetes o Docker Swarm

---

## 🔐 Seguridad

### Capas de Seguridad

#### 1. Firewall de Aplicación Web (WAF)
- **ModSecurity + OWASP CRS**
- **Reglas activas:**
  - SQL Injection detection
  - Cross-Site Scripting (XSS)
  - Remote File Inclusion (RFI)
  - Local File Inclusion (LFI)
  - Command Injection
  - Session Fixation
- **Configuración:**
  - Paranoia Level 1 (balance detección/falsos positivos)
  - Anomaly scoring: 20 inbound, 5 outbound
- **Certificados TLS:** Montados en `/etc/nginx/certs` (read-only)

#### 2. Bloqueo de IPs (Fail2Ban)
- **Monitoreo:** Logs de Nginx/WAF
- **Acción:** Bloqueo temporal/permanente vía iptables
- **Jails configurables:**
  - `nginx-botsearch` (bots maliciosos)
  - `nginx-http-auth` (fuerza bruta en login)
  - `nginx-limit-req` (rate limit exceeded)

#### 3. Autenticación y Autorización
- **JWT Tokens:** Generados en login, validados en cada request
- **Google OAuth:** Integración para login social
- **Roles:** Cliente, Encargado, Admin

#### 4. Base de Datos
- **Usuarios con roles mínimos:**
  - `devuser` (admin) - Solo para setup/operaciones
  - `pmm` (read-only) - Solo monitoreo
  - Backend conecta con usuario limitado a `mi_app_db`
- **Autenticación:** `authSource=admin`
- **Conexión cifrada:** Considerar TLS en producción

#### 5. Secretos
- **Recomendación:** Migrar a `.env` y no commitear
- **Variables sensibles:**
  - Contraseñas de MongoDB
  - Contraseñas de PMM
  - JWT secret
  - Mercado Pago tokens
  - Claves de Google OAuth

---

## 📊 Observabilidad

### Métricas y Monitoreo

#### PMM (Percona Monitoring and Management)

**Dashboards disponibles:**
1. **MongoDB Overview:**
   - Operaciones por segundo (reads/writes)
   - Latencia promedio
   - Conexiones activas
   - Memoria WiredTiger

2. **Query Analytics:**
   - Queries más lentas (via profiler)
   - Queries más frecuentes
   - Execution plans
   - Index usage

3. **Replica Set Status:**
   - Estado de cada nodo (PRIMARY/SECONDARY)
   - Replication lag
   - Oplog window
   - Elections history

**Acceso:** `http://localhost:8082`  
**Credenciales:** Configurar en primer acceso (cambiar `admin:admin`)

#### Logs

**Ubicación:** `./logs/nginx/`

**Tipos de logs:**
- `access.log` - Requests HTTP
- `error.log` - Errores de Nginx
- `modsec_audit.log` - Auditoría de WAF

**Análisis:**
```bash
# Requests más frecuentes
cat logs/nginx/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head

# IPs bloqueadas por Fail2Ban
docker compose exec fail2ban fail2ban-client status nginx-limit-req

# Ataques detectados por WAF
grep "ModSecurity" logs/nginx/modsec_audit.log | tail -50
```

---

## 💾 Backups y Recuperación

### Estrategia de Backup

#### Backups Automáticos (mongo_backup)

**Programación:** Diaria a las 2:00 AM (via cron)

**Proceso:**
```bash
# Script: backup/backup.sh
mongodump \
  --host mongo-primary:27017 \
  --username devuser \
  --password devpass \
  --authenticationDatabase admin \
  --db mi_app_db \
  --out /backup/dumps/backup_$(date +%Y%m%d_%H%M%S)
```

**Retención:** Configurar en script (ej: últimos 7 días)

**Volumen:** `./backup/dumps/` en host (persistente)

#### Restauración

**Comando:**
```bash
# Script: backup/restore.sh
mongorestore \
  --host mongo-primary:27017 \
  --username devuser \
  --password devpass \
  --authenticationDatabase admin \
  --db mi_app_db \
  /backup/dumps/backup_20251127_020000
```

**Testing:**
```bash
docker compose exec mongo_backup bash /backup/test_backup.sh
```

#### Backup de Redis (opcional)

Redis ya persiste con AOF en `redis_data` volume. Para backup explícito:
```bash
docker compose exec redis redis-cli BGSAVE
docker cp redis_hia:/data/dump.rdb ./backup/redis_backup.rdb
```

---

## 🚀 Despliegue y Escalabilidad

### Entornos

#### Desarrollo
```bash
# Levantar con herramientas de admin
docker compose up -d

# Expone:
# - WAF: 443
# - PMM: 8082
# - Mongo Express: 8081
# - MongoDB: 27017, 27018, 27019
# - Redis: 6379
```

#### Producción (recomendado)
```bash
# Solo exponer WAF
# Quitar ports de mongo-primary, redis, mongo-express

docker compose up -d waf frontend backend mongo-primary mongo-secondary1 mongo-secondary2 mongo-setup redis mongo_backup fail2ban

# Expone solo:
# - WAF: 443
```

### Escalabilidad Horizontal

**Backend:**
- Múltiples instancias detrás de load balancer
- Session state en Redis (stateless)
- Configurar `docker compose scale backend=3`

**Frontend:**
- CDN para assets estáticos
- Nginx como balanceador de múltiples contenedores

**MongoDB:**
- Sharding para datasets > 1TB
- Considerar Atlas (managed) para producción

---

## 📚 Referencias

- [MongoDB Replica Set Docs](https://www.mongodb.com/docs/manual/replication/)
- [Redis Persistence](https://redis.io/docs/management/persistence/)
- [ModSecurity OWASP CRS](https://coreruleset.org/)
- [Percona PMM](https://www.percona.com/software/database-tools/percona-monitoring-and-management)
- [Fail2Ban Manual](https://www.fail2ban.org/)

---

---

## 🛠️ Servicios Auxiliares

### 1. MantisBT (Issue Tracking System)

#### Descripción
Sistema de seguimiento de bugs e issues basado en web para gestión de proyectos y tareas de desarrollo.

#### Arquitectura de MantisBT

**Servicios:**
- `mantisbt` - Aplicación web MantisBT 2.27.3
- `mantis_db` - Base de datos PostgreSQL 17
  

**Configuración del contenedor:**
```yaml
mantisbt:
  image: xlrl/mantisbt:2.27.3
  container_name: mantisbt
  environment:
    MANTIS_TIMEZONE: America/Argentina/Jujuy
    MANTIS_ENABLE_ADMIN: 1
    SMTP_HOST: ${SMTP_HOST}
    SMTP_PORT: ${SMTP_PORT}
    SMTP_USER: ${SMTP_USER}
    SMTP_PASS: ${SMTP_PASS}
    SMTP_FROM: ${SMTP_FROM}
    SMTP_MODE: ${SMTP_MODE}         # tls
    APP_URL: ${APP_URL}
  ports:
    - "8085:80"
  volumes:
    - ./config/config_inc.php:/var/www/html/config/config_inc.php:ro
```

#### Base de Datos MantisBT

**PostgreSQL 17:**
```yaml
mantis_db:
  image: postgres:17.6
  environment:
    POSTGRES_DB: mantis_bt
    POSTGRES_USER: defaultdb_uq64_user
    POSTGRES_PASSWORD: 39EBHhXA30MwMK7rimdltCxjWL8pxdbV
  volumes:
    - ./data/postgres_data2:/var/lib/postgresql/data
```

**Características:**
- Base de datos dedicada para MantisBT
- Persistencia en `./data/postgres_data2`
- Red privada `mantis_network` (aislada del sistema principal)

#### Configuración de MantisBT (config_inc.php)

**Conexión a base de datos:**
```php
$g_hostname               = 'mantis_db';
$g_db_type                = 'pgsql';
$g_database_name          = 'mantis_bt';
$g_db_username            = 'defaultdb_uq64_user';
$g_db_password            = '39EBHhXA30MwMK7rimdltCxjWL8pxdbV';
$g_db_port                = '5432';
```

**Configuración SMTP:**
```php
$g_enable_email_notification = ON;
$g_phpMailer_method          = PHPMAILER_METHOD_SMTP;
$g_smtp_host                 = env_var('SMTP_HOST');
$g_smtp_port                 = (int) env_var('SMTP_PORT', 2525);
$g_smtp_connection_mode      = env_var('SMTP_MODE', 'tls');
$g_smtp_username             = env_var('SMTP_USER');
$g_smtp_password             = env_var('SMTP_PASS');
$g_from_email                = env_var('SMTP_FROM');
```

**Características:**
- Notificaciones por email habilitadas
- Registro de usuarios permitido: `$g_allow_signup = ON`
- Caché HTTP: 600 segundos (10 minutos)
- Idioma: Español (`$g_default_language = 'spanish'`)
- URL pública configurable vía `APP_URL`

#### Acceso a MantisBT

**Local:**
```
http://localhost:8085
```

**Externo (vía WAF):**
```
https://tu-dominio.com/mantis
```

#### Integración con el Sistema Principal

**Flujo de acceso:**
```
Usuario → WAF (443) → MantisBT (8085) → mantis_db (5432)
```

**Separación de redes:**
- MantisBT opera en `mantis_network` (red privada independiente)
- No tiene acceso directo a MongoDB ni Redis del sistema principal
- Comunicación solo con su propia base de datos PostgreSQL

**Uso:**
- Gestión de bugs y tareas del proyecto
- Seguimiento de issues de desarrollo
- Notificaciones automáticas por email
- Logs de actividad de proyecto

---

### 2. Nextcloud (File Storage & Collaboration)

#### Descripción
Plataforma de almacenamiento en la nube y colaboración de código abierto.

#### Arquitectura de Nextcloud

**Servicios:**
- `nextcloud` - Servidor Nextcloud 28
- `nextcloud_db` - Base de datos PostgreSQL 16
  

**Configuración del contenedor:**
```yaml
nextcloud:
  image: nextcloud:latest
  container_name: nextcloud
  environment:
    POSTGRES_HOST: nextcloud_db
    POSTGRES_DB: nextcloud
    POSTGRES_USER: nextcloud_user
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    NEXTCLOUD_ADMIN_USER: ${NEXTCLOUD_ADMIN_USER}
    NEXTCLOUD_ADMIN_PASSWORD: ${NEXTCLOUD_ADMIN_PASSWORD}
  ports:
    - "8084:80"           # Solo acceso local
  volumes:
    - nextcloud_data:/var/www/html
```

#### Base de Datos Nextcloud

**PostgreSQL 16:**
```yaml
nextcloud_db:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: nextcloud
    POSTGRES_USER: nextcloud_user
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U nextcloud_user"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**Características:**
- Base de datos dedicada para Nextcloud
- Healthcheck activo para asegurar disponibilidad
- Volumen persistente `postgres_data`
- Red privada `nextcloud_network` (aislada)

#### Configuración de Nextcloud (config.php)

**Conexión a base de datos:**
```php
'dbtype' => 'pgsql',
'dbname' => 'nextcloud',
'dbhost' => 'nextcloud_db',
'dbport' => '',
'dbtableprefix' => 'oc_',
'dbuser' => 'nextcloud_user',
'dbpassword' => '${POSTGRES_PASSWORD}',
```

**Dominios de confianza:**
```php
'trusted_domains' => array(
    0 => 'localhost',
    1 => 'cloud.canchas-hia-nextcloud.com',
),
```

**Configuración de rendimiento:**
```php
'memcache.local' => '\\OC\\Memcache\\APCu',    // Caché local
'upgrade.disable-web' => true,                 // Seguridad
```

**Características:**
- Caché local APCu para mejorar rendimiento
- Directorio de datos: `/var/www/html/data`
- Apps personalizadas en `/var/www/html/custom_apps`
- Versión: 28.0.0.11
- URL pública: `https://cloud.canchas-hia-nextcloud.com`

#### Acceso a Nextcloud

**Local:**
```
http://localhost:8084
```
**Externo (vía WAF):**
```
https://tu-dominio.com/cloud   (o /nextcloud según configuración)
```

#### Integración con el Sistema Principal

**Flujo de acceso:**
```
Usuario → WAF (443) → Nextcloud (8084) → nextcloud_db (5432)
```

**Separación de redes:**
- Nextcloud opera en `nextcloud_network` (red privada independiente)
- No tiene acceso a MongoDB ni al backend principal
- Comunicación solo con su propia base de datos PostgreSQL
- Expuesto públicamente vía WAF (túnel único apunta al WAF)

**Uso:**
- Almacenamiento de archivos del proyecto
- Compartición de documentos
- Colaboración en documentos
- Backups de archivos importantes
- Sincronización de archivos entre dispositivos

---

### Comparación de Servicios Auxiliares

| Característica | MantisBT | Nextcloud |
|----------------|----------|-----------|
| **Función** | Issue Tracking | File Storage |
| **Versión** | 2.27.3 | 28.0.0.11 |
| **Base de datos** | PostgreSQL 17 | PostgreSQL 16 |
| **Puerto local** | 8085 | 8084 |
| **Exposición externa** | Vía WAF | Vía WAF |
| **Red interna** | `mantis_network` | `nextcloud_network` |
| **Acceso desde backend** | ❌ No (aislado) | ❌ No (aislado) |
| **Email** | ✅ SMTP configurado | ⚠️ Opcional |
| **Caché** | HTTP Cache 600s | APCu Local |
| **Persistencia** | `./data/postgres_data2` | Volume `nextcloud_data` |
| **Healthcheck** | ❌ No configurado | ✅ PostgreSQL check |

---

### Seguridad de Servicios Auxiliares

**MantisBT:**
- Configuración read-only montada (`config_inc.php:ro`)
- Credenciales de base de datos en variables de entorno
- SMTP con TLS habilitado
- Cookie SameSite: Lax
- Login anónimo deshabilitado: `$g_allow_anonymous_login = OFF`
- Recomendación: Cambiar `$g_cookie_secure_flag` a ON con HTTPS

**Nextcloud:**
- Actualización web deshabilitada por seguridad
- Dominios de confianza configurados
- Contraseñas en variables de entorno (no en código)
- Caché APCu para evitar acceso directo a archivos
- Healthcheck para prevenir downtime

**Recomendaciones generales:**
1. Migrar todas las contraseñas a `.env`
2. No exponer puertos locales (8081, 8085) en producción
3. Usar WAF para MantisBT y Nextcloud (ya configurado)
4. Implementar rate limiting en el WAF para rutas `/mantis` y `/cloud`
5. Configurar backups automáticos de ambas bases PostgreSQL

---

### Monitoreo de Servicios Auxiliares

**Logs de MantisBT:**
```bash
# Ver logs del contenedor
docker logs mantisbt --tail 100 -f

# Logs de PostgreSQL
docker logs mantis_db --tail 100 -f
```

**Logs de Nextcloud:**
```bash
# Ver logs del contenedor
docker logs nextcloud --tail 100 -f

# Logs de PostgreSQL
docker logs nextcloud_db --tail 100 -f

# Logs internos de Nextcloud
docker exec nextcloud tail -f /var/www/html/data/nextcloud.log
```

**Healthchecks:**
```bash
# Verificar estado de Nextcloud
docker inspect nextcloud_db | grep -A 5 Health

# Verificar conectividad PostgreSQL
docker exec nextcloud_db pg_isready -U nextcloud_user
docker exec mantis_db psql -U defaultdb_uq64_user -d mantis_bt -c "SELECT version();"
```

**Métricas recomendadas (futuro):**
- Integrar PMM para monitorear PostgreSQL de ambos servicios
- Monitorear el estado del túnel único de Cloudflare hacia el WAF
- Monitorear espacio en disco de volúmenes `nextcloud_data` y `postgres_data`

---

**Mantenido por:** GitHub Copilot  
**Última actualización:** 27 de noviembre de 2025
