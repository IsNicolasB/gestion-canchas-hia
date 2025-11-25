/**
 * Middleware de Caché con Redis
 * Intercepta requests GET y cachea respuestas exitosas
 */

const { getRedisClient, isRedisAvailable } = require('../config/redis');

/**
 * Middleware para cachear respuestas GET
 * @param {number} ttl - Tiempo de vida en segundos (default: 300 = 5 minutos)
 * @param {function} keyGenerator - Función opcional para generar clave personalizada
 * @returns {function} Middleware de Express
 */
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Solo cachear requests GET
    if (req.method !== 'GET') {
      return next();
    }

    // Verificar si Redis está disponible
    if (!isRedisAvailable()) {
      return next();
    }

    const redis = getRedisClient();

    try {
      // Generar clave de caché
      let cacheKey;
      if (keyGenerator && typeof keyGenerator === 'function') {
        cacheKey = keyGenerator(req);
      } else {
        // Clave por defecto: incluye URL completa y query params
        const queryString = Object.keys(req.query).length > 0 
          ? '?' + new URLSearchParams(req.query).toString()
          : '';
        cacheKey = `cache:${req.originalUrl}${queryString}`;
      }

      // Buscar en caché
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        console.log(`✅ CACHE HIT: ${cacheKey}`);
        
        const parsedData = JSON.parse(cachedData);
        
        return res.status(200).json({
          ...parsedData,
          _cached: true,
          _cacheKey: cacheKey,
          _timestamp: new Date().toISOString()
        });
      }

      console.log(`❌ CACHE MISS: ${cacheKey}`);

      // Interceptar res.json para guardar en caché
      const originalJson = res.json.bind(res);
      
      res.json = function(data) {
        // Solo cachear respuestas exitosas
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success !== false) {
          // Guardar en caché de forma asíncrona (no bloqueante)
          redis.setEx(cacheKey, ttl, JSON.stringify(data))
            .then(() => console.log(`💾 CACHE SAVED: ${cacheKey} (TTL: ${ttl}s)`))
            .catch(err => console.error('❌ Error guardando en caché:', err.message));
        }
        
        return originalJson(data);
      };

      next();

    } catch (error) {
      console.error('❌ Error en cacheMiddleware:', error.message);
      // Continuar sin caché en caso de error
      next();
    }
  };
};

/**
 * Invalidar caché por patrón de clave
 * @param {string} pattern - Patrón de claves a invalidar (ej: 'cache:/api/canchas*')
 * @returns {Promise<number>} Número de claves eliminadas
 */
const invalidateCache = async (pattern) => {
  if (!isRedisAvailable()) {
    console.warn('⚠️ Redis no disponible para invalidar caché');
    return 0;
  }

  const redis = getRedisClient();

  try {
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      console.log(`ℹ️ No se encontraron claves para: ${pattern}`);
      return 0;
    }

    const deleted = await redis.del(keys);
    console.log(`🗑️ Cache invalidado: ${deleted} claves eliminadas (patrón: ${pattern})`);
    
    return deleted;

  } catch (error) {
    console.error('❌ Error invalidando caché:', error.message);
    return 0;
  }
};

/**
 * Invalidar caché por clave exacta
 * @param {string} key - Clave exacta a eliminar
 * @returns {Promise<number>} 1 si eliminada, 0 si no existía
 */
const invalidateCacheKey = async (key) => {
  if (!isRedisAvailable()) {
    return 0;
  }

  const redis = getRedisClient();

  try {
    const deleted = await redis.del(key);
    if (deleted > 0) {
      console.log(`🗑️ Cache key eliminada: ${key}`);
    }
    return deleted;
  } catch (error) {
    console.error('❌ Error eliminando cache key:', error.message);
    return 0;
  }
};

/**
 * Invalidar múltiples patrones de caché
 * @param {string[]} patterns - Array de patrones a invalidar
 * @returns {Promise<number>} Total de claves eliminadas
 */
const invalidateMultiplePatterns = async (patterns) => {
  if (!isRedisAvailable()) {
    return 0;
  }

  let totalDeleted = 0;
  
  for (const pattern of patterns) {
    const deleted = await invalidateCache(pattern);
    totalDeleted += deleted;
  }

  return totalDeleted;
};

/**
 * Middleware para invalidar caché automáticamente en operaciones de escritura
 * @param {string[]} patterns - Patrones a invalidar
 * @returns {function} Middleware de Express
 */
const autoInvalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Solo para operaciones de escritura
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Interceptar res.json para invalidar después de respuesta exitosa
      const originalJson = res.json.bind(res);
      
      res.json = async function(data) {
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success !== false) {
          await invalidateMultiplePatterns(patterns);
        }
        return originalJson(data);
      };
    }
    
    next();
  };
};

/**
 * Obtener valor de caché manualmente
 * @param {string} key - Clave a buscar
 * @returns {Promise<any|null>} Datos parseados o null
 */
const getCacheValue = async (key) => {
  if (!isRedisAvailable()) {
    return null;
  }

  const redis = getRedisClient();

  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('❌ Error obteniendo valor de caché:', error.message);
    return null;
  }
};

/**
 * Establecer valor en caché manualmente
 * @param {string} key - Clave
 * @param {any} value - Valor a guardar
 * @param {number} ttl - TTL en segundos
 * @returns {Promise<boolean>} true si se guardó exitosamente
 */
const setCacheValue = async (key, value, ttl = 300) => {
  if (!isRedisAvailable()) {
    return false;
  }

  const redis = getRedisClient();

  try {
    await redis.setEx(key, ttl, JSON.stringify(value));
    console.log(`💾 Valor guardado en caché: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error('❌ Error guardando valor en caché:', error.message);
    return false;
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateCacheKey,
  invalidateMultiplePatterns,
  autoInvalidateCache,
  getCacheValue,
  setCacheValue
};
