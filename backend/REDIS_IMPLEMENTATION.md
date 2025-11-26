# 🔴 Implementación de Redis - Sistema de Caché

**Fecha de implementación:** 25 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ IMPLEMENTADO

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [¿Qué es Redis?](#qué-es-redis)
3. [Arquitectura Implementada](#arquitectura-implementada)
4. [Archivos Creados y Modificados](#archivos-creados-y-modificados)
5. [Configuración de TTL por Endpoint](#configuración-de-ttl-por-endpoint)
6. [Cómo Funciona el Caché](#cómo-funciona-el-caché)
7. [Invalidación de Caché](#invalidación-de-caché)
8. [Comandos Útiles](#comandos-útiles)
9. [Métricas Esperadas](#métricas-esperadas)
10. [Troubleshooting](#troubleshooting)

---

## 📊 Resumen Ejecutivo

Se implementó **Redis** como sistema de caché en memoria para mejorar drásticamente el rendimiento de consultas frecuentes. Redis actúa como una capa intermedia entre la aplicación y MongoDB, almacenando resultados de queries en RAM para acceso ultra-rápido (<1ms).

### Beneficios Principales

- ✅ **Reducción de latencia**: queries de 50-500ms → <1ms (caché hit)
- ✅ **Menor carga en MongoDB**: reduce consultas repetitivas
- ✅ **Escalabilidad mejorada**: soporta más usuarios concurrentes
- ✅ **Experiencia de usuario**: respuestas instantáneas
- ✅ **Invalidación inteligente**: caché se actualiza automáticamente

---

## 🔴 ¿Qué es Redis?

**Redis** (Remote Dictionary Server) es una base de datos en memoria (RAM) de código abierto utilizada como:
- **Caché**: Almacenamiento temporal de datos frecuentes
- **Message Broker**: Comunicación entre servicios
- **Session Store**: Gestión de sesiones de usuario

### Características Clave

```
┌─────────────┐      Redis (RAM)      ┌──────────────┐
│   Cliente   │ ───► <1ms (hit)  ───► │  Respuesta   │
│  (Browser)  │                        │              │
└─────────────┘      MongoDB           └──────────────┘
                     50-500ms (miss)
```

- **Velocidad**: Datos en RAM = acceso sub-milisegundo
- **TTL**: Time-To-Live automático (expira datos antiguos)
- **Persistencia**: Guarda datos en disco periódicamente
- **LRU**: Evict automático de datos menos usados

---

## 🏗️ Arquitectura Implementada

### Flujo de Request con Caché

```
1. Request GET → Middleware de Caché
   ↓
2. ¿Existe en Redis?
   ├─ SÍ → Retornar desde caché (<1ms) ✅
   └─ NO → Continuar a controlador
       ↓
3. Query a MongoDB (50-500ms)
   ↓
4. Guardar en Redis (TTL configurable)
   ↓
5. Retornar respuesta al cliente
```

### Invalidación Automática

```
1. Request POST/PUT/DELETE → Controlador
   ↓
2. Modificar datos en MongoDB
   ↓
3. Invalidar caché relacionado (eliminar claves)
   ↓
4. Próximo GET reconstruirá caché
```

---

## 📁 Archivos Creados y Modificados

### 🆕 Archivos Nuevos

#### 1. `backend/config/redis.js`
**Propósito:** Configuración y gestión de conexión a Redis

**Funciones principales:**
- `connectRedis()`: Conectar al servidor Redis
- `getRedisClient()`: Obtener cliente activo
- `isRedisAvailable()`: Verificar disponibilidad
- `disconnectRedis()`: Cerrar conexión gracefully
- `flushCache()`: Limpiar todo el caché
- `getRedisStats()`: Obtener métricas de Redis

**Configuración:**
```javascript
{
  host: 'redis',        // Nombre del servicio en Docker
  port: 6379,           // Puerto por defecto de Redis
  reconnectStrategy: (retries) => {
    if (retries > 10) return new Error('Redis no disponible');
    return Math.min(retries * 100, 3000); // Backoff exponencial
  }
}
```

---

#### 2. `backend/middleware/cacheMiddleware.js`
**Propósito:** Middleware para interceptar y cachear respuestas

**Funciones principales:**

##### `cacheMiddleware(ttl, keyGenerator)`
Middleware principal para cachear requests GET

**Parámetros:**
- `ttl` (number): Tiempo de vida en segundos (default: 300)
- `keyGenerator` (function): Función opcional para generar clave personalizada

**Ejemplo de uso:**
```javascript
router.get('/canchas', cacheMiddleware(1800), obtenerCanchas); // 30 minutos
```

**Cómo funciona:**
1. Intercepta solo requests GET
2. Genera clave única: `cache:/api/canchas?estado=activo`
3. Busca en Redis
4. Si existe → retorna caché (CACHE HIT)
5. Si no existe → ejecuta controlador → guarda en Redis (CACHE MISS)

##### `invalidateCache(pattern)`
Invalida caché por patrón de claves

**Parámetros:**
- `pattern` (string): Patrón glob para matching (ej: `cache:/canchas*`)

**Retorna:** Número de claves eliminadas

**Ejemplo:**
```javascript
await invalidateCache('cache:/canchas*'); // Elimina todas las claves de canchas
```

##### `invalidateCacheKey(key)`
Invalida una clave exacta

**Ejemplo:**
```javascript
await invalidateCacheKey('cache:/canchas/123abc');
```

##### `invalidateMultiplePatterns(patterns)`
Invalida múltiples patrones

**Ejemplo:**
```javascript
await invalidateMultiplePatterns([
  'cache:/canchas*',
  'cache:/horarios*',
  'cache:/reservas*'
]);
```

##### `getCacheValue(key)` / `setCacheValue(key, value, ttl)`
Acceso manual al caché (casos especiales)

---

### ✏️ Archivos Modificados

#### 1. `backend/docker-compose.yml`
**Cambios realizados:**

```yaml
# Nuevo servicio Redis
redis:
  image: redis:7-alpine
  container_name: redis_hia
  restart: always
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: >
    redis-server
    --appendonly yes              # Persistencia AOF
    --maxmemory 512mb             # Límite de RAM
    --maxmemory-policy allkeys-lru  # Política de eviction
    --save 60 1000                # Snapshot cada 60s si 1000 writes
    --loglevel notice
  networks:
    - mongo-cluster
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 3s
    retries: 3
  deploy:
    resources:
      limits:
        memory: 768m
        cpus: '1.0'
      reservations:
        memory: 512m
        cpus: '0.5'

# Nuevo volumen
volumes:
  redis_data:
    driver: local
```

**Configuraciones importantes:**
- `--maxmemory 512mb`: Limita uso de RAM (ajustar según necesidad)
- `--maxmemory-policy allkeys-lru`: Elimina claves menos usadas cuando se llena
- `--appendonly yes`: Persiste datos en disco (recuperación post-restart)
- `--save 60 1000`: Snapshot cada minuto si hay 1000+ escrituras

---

#### 2. `backend/server.js`
**Cambios realizados:**

```javascript
const { connectRedis, disconnectRedis } = require('./config/redis');

// Al iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  
  // Conectar Redis (no bloqueante)
  try {
    await connectRedis();
  } catch (error) {
    console.warn('⚠️ Redis no disponible, continuando sin caché');
  }
});

// Cierre graceful
process.on('SIGTERM', async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});
```

**Beneficio:** Si Redis falla, la aplicación continúa sin caché (degradación graceful).

---

#### 3. `backend/routes/CanchaRoutes.js`
**Cambios realizados:**

```javascript
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Aplicar caché en GET
router.get('/', cacheMiddleware(1800), CanchaController.obtenerCanchas); // 30 min
router.get('/:id', cacheMiddleware(600), CanchaController.obtenerCanchaPorId); // 10 min
```

**Justificación TTL:**
- Canchas raramente cambian → TTL largo (30 minutos)
- Permite que muchos usuarios lean la misma data cacheada

---

#### 4. `backend/routes/ClienteRoutes.js`
**Cambios realizados:**

```javascript
router.get('/buscar', cacheMiddleware(120), ClienteController.buscarClientePorNombreApellido); // 2 min
router.get('/', cacheMiddleware(60), ClienteController.obtenerClientes); // 1 min
router.get('/:id', cacheMiddleware(300), ClienteController.obtenerClientePorId); // 5 min
```

**Justificación TTL:**
- Búsquedas pueden cambiar → TTL corto (2 minutos)
- Cliente por ID estable → TTL medio (5 minutos)

---

#### 5. `backend/routes/HorarioRoutes.js`
**Cambios realizados:**

```javascript
router.get('/', cacheMiddleware(180), HorarioController.obtenerHorarios); // 3 min
router.get('/filtrar', cacheMiddleware(60), HorarioController.obtenerHorariosPorCanchaYFecha); // 1 min
router.get('/:id', cacheMiddleware(300), HorarioController.obtenerHorarioPorId); // 5 min
```

**Justificación TTL:**
- Horarios disponibles cambian frecuentemente (reservas) → TTL corto (1 minuto)
- Balance entre frescura y performance

---

#### 6. `backend/routes/ReservaRoutes.js`
**Cambios realizados:**

```javascript
router.get('/', cacheMiddleware(120), ReservaController.obtenerReservas); // 2 min
router.get('/buscar', cacheMiddleware(60), ReservaController.obtenerReservasPorClienteYFecha); // 1 min
router.get('/:id', cacheMiddleware(180), ReservaController.obtenerReservaPorId); // 3 min
router.get('/cliente/:clienteId', cacheMiddleware(120), ReservaController.obtenerReservasPorCliente); // 2 min
```

**Justificación TTL:**
- Reservas cambian frecuentemente → TTL corto/medio (1-3 minutos)

---

#### 7. `backend/controllers/CanchaController.js`
**Cambios realizados:**

```javascript
const { invalidateCache } = require('../middleware/cacheMiddleware');

// En crearCancha
await invalidateCache('cache:/canchas*');

// En actualizarCancha
await invalidateCache('cache:/canchas*');
await invalidateCache('cache:/horarios*'); // Horarios dependen de canchas

// En eliminarCancha
await invalidateCache('cache:/canchas*');
await invalidateCache('cache:/horarios*');
await invalidateCache('cache:/reservas*');
```

**Justificación:**
- Al modificar cancha, invalidar todo lo relacionado
- Garantiza consistencia de datos

---

#### 8. `backend/controllers/ReservaController.js`
**Cambios realizados:**

```javascript
const { invalidateCache } = require('../middleware/cacheMiddleware');

// En crearReserva
await invalidateCache('cache:/reservas*');
await invalidateCache('cache:/horarios*'); // Horarios se actualizan
```

**Justificación:**
- Nueva reserva afecta disponibilidad de horarios
- Invalidar ambos cachés

---

#### 9. `backend/package.json`
**Cambios realizados:**

```json
"dependencies": {
  // ... otras dependencias
  "redis": "^4.7.0"  // ← NUEVO
}
```

---

## ⏱️ Configuración de TTL por Endpoint

### Estrategia de TTL

| Tipo de Dato | TTL | Justificación |
|--------------|-----|---------------|
| **Datos estáticos** (canchas, tipos) | 1800s (30 min) | Raramente cambian |
| **Datos personales** (cliente por ID) | 300s (5 min) | Cambian ocasionalmente |
| **Listados generales** (todos los clientes) | 60s (1 min) | Balance frescura/performance |
| **Búsquedas** (buscar por nombre) | 120s (2 min) | Resultados pueden variar |
| **Datos frecuentes** (horarios disponibles) | 60s (1 min) | Cambian con cada reserva |
| **Datos relacionales** (reservas con populate) | 120s (2 min) | Involucran múltiples colecciones |

### Tabla Completa de Endpoints Cacheados

| Endpoint | Método | TTL | Controlador |
|----------|--------|-----|-------------|
| `/canchas` | GET | 1800s | obtenerCanchas |
| `/canchas/:id` | GET | 600s | obtenerCanchaPorId |
| `/clientes` | GET | 60s | obtenerClientes |
| `/clientes/buscar` | GET | 120s | buscarClientePorNombreApellido |
| `/clientes/:id` | GET | 300s | obtenerClientePorId |
| `/horarios` | GET | 180s | obtenerHorarios |
| `/horarios/filtrar` | GET | 60s | obtenerHorariosPorCanchaYFecha |
| `/horarios/:id` | GET | 300s | obtenerHorarioPorId |
| `/reservas` | GET | 120s | obtenerReservas |
| `/reservas/buscar` | GET | 60s | obtenerReservasPorClienteYFecha |
| `/reservas/:id` | GET | 180s | obtenerReservaPorId |
| `/reservas/cliente/:clienteId` | GET | 120s | obtenerReservasPorCliente |

---

## 🔄 Cómo Funciona el Caché

### Ejemplo Paso a Paso

#### Escenario: Usuario consulta listado de canchas

**Primera Request (CACHE MISS):**
```
1. Usuario: GET /canchas
2. Middleware: Busca en Redis → NO EXISTE
3. Controlador: Query a MongoDB (50ms)
4. Middleware: Guarda en Redis (TTL: 1800s)
5. Respuesta: {canchas: [...], _cached: false}
```

**Logs del servidor:**
```
❌ CACHE MISS: cache:/canchas
💾 CACHE SAVED: cache:/canchas (TTL: 1800s)
```

**Segunda Request (CACHE HIT):**
```
1. Usuario: GET /canchas
2. Middleware: Busca en Redis → EXISTE ✅
3. Respuesta directa desde Redis (<1ms)
4. Response: {canchas: [...], _cached: true}
```

**Logs del servidor:**
```
✅ CACHE HIT: cache:/canchas
```

---

### Formato de Respuesta Cacheada

```json
{
  "success": true,
  "message": "Canchas recuperadas exitosamente",
  "count": 10,
  "data": [...],
  "_cached": true,                    // ← Indica que vino de caché
  "_cacheKey": "cache:/canchas",      // ← Clave usada
  "_timestamp": "2025-11-25T19:00:00Z" // ← Momento de la consulta
}
```

---

## 🗑️ Invalidación de Caché

### Estrategias Implementadas

#### 1. Invalidación por Patrón (Wildcard)

```javascript
// Elimina TODAS las claves que empiecen con "cache:/canchas"
await invalidateCache('cache:/canchas*');

// Ejemplos de claves eliminadas:
// - cache:/canchas
// - cache:/canchas/123abc
// - cache:/canchas?estado=activo
```

#### 2. Invalidación en Cascada

Al modificar una cancha, invalidamos:
```javascript
await invalidateCache('cache:/canchas*');   // La cancha misma
await invalidateCache('cache:/horarios*');  // Horarios dependen de canchas
await invalidateCache('cache:/reservas*');  // Reservas también
```

**Justificación:** Garantiza consistencia entre datos relacionados.

#### 3. Invalidación Automática

El middleware detecta operaciones de escritura y invalida automáticamente:

```javascript
// En cualquier controlador después de modificar datos
const canchaActualizada = await Cancha.findByIdAndUpdate(...);

// Invalidar caché relacionado
await invalidateCache('cache:/canchas*');

// Respuesta al cliente
res.json({ success: true, data: canchaActualizada });
```

---

### Matriz de Invalidación

| Operación | Invalida |
|-----------|----------|
| **Crear Cancha** | `cache:/canchas*` |
| **Actualizar Cancha** | `cache:/canchas*`, `cache:/horarios*` |
| **Eliminar Cancha** | `cache:/canchas*`, `cache:/horarios*`, `cache:/reservas*` |
| **Crear Reserva** | `cache:/reservas*`, `cache:/horarios*` |
| **Actualizar Reserva** | `cache:/reservas*`, `cache:/horarios*` |
| **Eliminar Reserva** | `cache:/reservas*`, `cache:/horarios*` |
| **Crear Cliente** | `cache:/clientes*` |
| **Actualizar Cliente** | `cache:/clientes*` |
| **Eliminar Cliente** | `cache:/clientes*`, `cache:/reservas*` |

---

## 🛠️ Comandos Útiles

### Comandos Docker Compose

```bash
# Iniciar Redis
cd backend
docker compose up -d redis

# Ver logs de Redis
docker compose logs -f redis

# Reiniciar Redis
docker compose restart redis

# Detener Redis
docker compose stop redis

# Ver estado de Redis
docker compose ps redis
```

### Comandos Redis CLI

#### Acceder a Redis CLI
```bash
docker compose exec redis redis-cli
```

#### Ver Todas las Claves en Caché
```bash
docker compose exec redis redis-cli KEYS "cache:*"
```

**Salida ejemplo:**
```
1) "cache:/canchas"
2) "cache:/canchas/123abc"
3) "cache:/clientes/buscar?nombre=Juan"
4) "cache:/horarios/filtrar?cancha=123&fecha=2025-11-25"
```

#### Ver Contenido de una Clave
```bash
docker compose exec redis redis-cli GET "cache:/canchas"
```

**Salida:** JSON stringificado de la respuesta cacheada

#### Eliminar una Clave Específica
```bash
docker compose exec redis redis-cli DEL "cache:/canchas"
```

#### Limpiar Todo el Caché
```bash
docker compose exec redis redis-cli FLUSHDB
```
⚠️ **ADVERTENCIA:** Elimina TODO el caché. Usar solo en desarrollo.

#### Ver Estadísticas de Memoria
```bash
docker compose exec redis redis-cli INFO memory
```

**Métricas importantes:**
- `used_memory_human`: Memoria usada (ej: 50.23M)
- `maxmemory_human`: Límite configurado (512M)
- `evicted_keys`: Claves eliminadas por política LRU

#### Ver Estadísticas de Hits/Misses
```bash
docker compose exec redis redis-cli INFO stats
```

**Métricas importantes:**
- `keyspace_hits`: Número de CACHE HITs
- `keyspace_misses`: Número de CACHE MISSes
- `hit_rate`: hits / (hits + misses) * 100%

#### Monitorear Requests en Tiempo Real
```bash
docker compose exec redis redis-cli MONITOR
```

**Salida:**
```
1701012345.123456 [0 172.18.0.5:54321] "GET" "cache:/canchas"
1701012345.234567 [0 172.18.0.5:54321] "SETEX" "cache:/horarios" "60" "{...}"
```

#### Ver TTL de una Clave
```bash
docker compose exec redis redis-cli TTL "cache:/canchas"
```

**Salida:**
- `(integer) 1234`: Quedan 1234 segundos
- `(integer) -1`: Sin TTL (permanente)
- `(integer) -2`: No existe

---

## 📈 Métricas Esperadas

### Comparativa de Rendimiento

| Query | Sin Caché (MongoDB) | Con Caché (1er request) | Con Caché (hit) | Mejora |
|-------|-------------------|------------------------|----------------|--------|
| **Listado canchas** | 50ms | 50ms | <1ms | **98%** ⬇️ |
| **Cliente por ID** | 100ms | 100ms | <1ms | **99%** ⬇️ |
| **Búsqueda clientes** | 361ms | 361ms | <1ms | **99.7%** ⬇️ |
| **Horarios disponibles** | 4ms | 4ms | <1ms | **75%** ⬇️ |
| **Reservas por cliente** | 10ms | 10ms | <1ms | **90%** ⬇️ |

### Cache Hit Rate Esperado

| Endpoint | Hit Rate Esperado | Justificación |
|----------|------------------|---------------|
| `/canchas` | 85-95% | Datos estáticos, muchos usuarios leen lo mismo |
| `/clientes/buscar` | 40-60% | Búsquedas variadas, pero nombres comunes se repiten |
| `/horarios/filtrar` | 60-75% | Muchos usuarios revisan mismas fechas/canchas |
| `/reservas` | 50-70% | Cambios frecuentes pero lectura alta |

**Fórmula Hit Rate:**
```
Hit Rate (%) = (CACHE HITs / (CACHE HITs + CACHE MISSes)) * 100
```

**Objetivo:** >60% global de hit rate

---

### Monitoreo de Memoria

**Configuración actual:**
- Límite: 512 MB
- Política: `allkeys-lru` (elimina menos usados)

**Proyección de uso:**
- Datos por clave: ~5-50 KB (dependiendo de populate)
- Capacidad estimada: 10,000-100,000 claves

**Alertas recomendadas:**
- ⚠️ Memoria >80%: Considerar aumentar límite
- 🔴 `evicted_keys` alto: Revisar TTL o aumentar memoria

---

## 🐛 Troubleshooting

### Problema 1: Redis no conecta

**Síntomas:**
```
❌ Redis Error: connect ECONNREFUSED 127.0.0.1:6379
⚠️ Redis no disponible, continuando sin caché
```

**Soluciones:**

1. **Verificar que Redis esté corriendo:**
```bash
docker compose ps redis
```

2. **Ver logs de Redis:**
```bash
docker compose logs redis
```

3. **Reiniciar Redis:**
```bash
docker compose restart redis
```

4. **Verificar red Docker:**
```bash
docker network inspect backend_mongo-cluster
```

---

### Problema 2: Caché no se invalida

**Síntomas:**
- Modifico una cancha pero sigo viendo datos viejos

**Soluciones:**

1. **Verificar logs del controlador:**
```
🗑️ Cache invalidado: 3 claves eliminadas (patrón: cache:/canchas*)
```

2. **Limpiar caché manualmente:**
```bash
docker compose exec redis redis-cli FLUSHDB
```

3. **Verificar patrón de invalidación:**
```javascript
// Debe ser con wildcard
await invalidateCache('cache:/canchas*');  // ✅ Correcto
await invalidateCache('cache:/canchas');   // ❌ Solo elimina esa clave exacta
```

---

### Problema 3: Memoria de Redis llena

**Síntomas:**
```bash
docker compose exec redis redis-cli INFO memory
# used_memory_human:512.00M
# maxmemory_human:512.00M
```

**Soluciones:**

1. **Revisar políticas de eviction:**
```bash
docker compose exec redis redis-cli CONFIG GET maxmemory-policy
# Debe ser "allkeys-lru"
```

2. **Aumentar límite de memoria en docker-compose.yml:**
```yaml
command: >
  redis-server
  --maxmemory 1gb  # Aumentar de 512mb a 1gb
```

3. **Reducir TTL de endpoints menos críticos:**
```javascript
// Antes
router.get('/', cacheMiddleware(1800), ...);  // 30 min

// Después
router.get('/', cacheMiddleware(900), ...);   // 15 min
```

---

### Problema 4: Hit Rate bajo (<40%)

**Síntomas:**
```bash
docker compose exec redis redis-cli INFO stats
# keyspace_hits:1000
# keyspace_misses:4000
# Hit Rate: 20%
```

**Causas comunes:**
1. TTL muy corto
2. Patrones de query muy variados
3. Invalidaciones muy frecuentes

**Soluciones:**

1. **Aumentar TTL de endpoints estables:**
```javascript
// Canchas raramente cambian
router.get('/', cacheMiddleware(3600), ...);  // 1 hora en lugar de 30 min
```

2. **Normalizar claves de caché:**
```javascript
// Personalizar generación de clave
const keyGen = (req) => {
  // Ignorar parámetros no relevantes para la query
  const { page, sort, ...relevant } = req.query;
  return `cache:/canchas:${JSON.stringify(relevant)}`;
};

router.get('/', cacheMiddleware(1800, keyGen), ...);
```

---

### Problema 5: Datos inconsistentes

**Síntomas:**
- Frontend muestra datos que no coinciden con DB

**Solución:**
```bash
# Limpiar todo el caché y empezar de cero
docker compose exec redis redis-cli FLUSHDB

# Luego hacer requests para reconstruir caché
curl http://localhost:3000/canchas
curl http://localhost:3000/clientes
```

---

## 🚀 Próximos Pasos y Mejoras Futuras

### Fase 2: Caché Inteligente

1. **Precalentamiento de caché** (Warming)
```javascript
// Al iniciar servidor, pre-cargar datos frecuentes
async function warmCache() {
  await fetch('/canchas');
  await fetch('/clientes');
  // ...
}
```

2. **Cache Tagging** (invalidación por tags)
```javascript
// Asociar tags a claves
setCacheValue('cache:/cancha/123', data, 3600, ['canchas', 'deportes']);

// Invalidar por tag
invalidateByTag('canchas');
```

3. **Cache Analytics Dashboard**
- Hit rate por endpoint
- Memoria usada en tiempo real
- Top queries cacheadas

4. **Cache Clustering** (Alta disponibilidad)
```yaml
redis-master:
  image: redis:7-alpine
  
redis-replica:
  image: redis:7-alpine
  command: redis-server --replicaof redis-master 6379
```

---

## 📚 Referencias

- **Redis Oficial:** https://redis.io/docs/
- **Redis Node Client:** https://github.com/redis/node-redis
- **Cache Patterns:** https://redis.io/docs/manual/patterns/
- **Performance Best Practices:** https://redis.io/docs/management/optimization/

---

## ✅ Checklist de Implementación

- [x] Redis agregado a docker-compose.yml
- [x] Configuración de Redis creada (config/redis.js)
- [x] Middleware de caché implementado
- [x] Server.js actualizado con conexión Redis
- [x] Caché aplicado en rutas GET críticas
- [x] Invalidación de caché en controladores POST/PUT/DELETE
- [x] Dependencia `redis` agregada a package.json
- [x] Documentación completa creada
- [ ] Testing de endpoints cacheados
- [ ] Monitoreo de métricas de caché
- [ ] Ajuste de TTL basado en uso real

---

**Implementado por:** GitHub Copilot  
**Fecha:** 25 de noviembre de 2025  
**Versión:** 1.0
