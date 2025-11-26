/**
 * Configuración de Redis para caché de aplicación
 * Gestiona conexión y proporciona cliente reutilizable
 */

const redis = require('redis');

let redisClient = null;
let isConnected = false;

/**
 * Conectar a Redis
 * @returns {Promise<RedisClient|null>} Cliente de Redis o null si falla
 */
const connectRedis = async () => {
  try {
    const redisConfig = {
      socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis: Máximo de reintentos alcanzado');
            return new Error('Redis no disponible');
          }
          const delay = Math.min(retries * 100, 3000);
          console.log(`🔄 Redis: Reintentando conexión en ${delay}ms...`);
          return delay;
        }
      }
    };

    redisClient = redis.createClient(redisConfig);

    // Event Handlers
    redisClient.on('error', (err) => {
      console.error('❌ Redis Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis: Conectando...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis: Conexión establecida y listo');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Reconectando...');
      isConnected = false;
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis: Conexión cerrada');
      isConnected = false;
    });

    // Conectar
    await redisClient.connect();

    // Verificar conexión
    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      console.log('✅ Redis: Verificación exitosa (PING -> PONG)');
    }

    return redisClient;

  } catch (error) {
    console.error('❌ Error conectando a Redis:', error.message);
    console.warn('⚠️ La aplicación continuará sin caché');
    redisClient = null;
    isConnected = false;
    return null;
  }
};

/**
 * Obtener cliente de Redis
 * @returns {RedisClient|null} Cliente activo o null
 */
const getRedisClient = () => {
  return redisClient;
};

/**
 * Verificar si Redis está disponible
 * @returns {boolean} Estado de conexión
 */
const isRedisAvailable = () => {
  return isConnected && redisClient && redisClient.isOpen;
};

/**
 * Cerrar conexión de Redis gracefully
 * @returns {Promise<void>}
 */
const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      console.log('✅ Redis: Desconexión exitosa');
    } catch (error) {
      console.error('❌ Error desconectando Redis:', error.message);
    }
  }
};

/**
 * Limpiar toda la caché (usar con precaución)
 * @returns {Promise<void>}
 */
const flushCache = async () => {
  if (!isRedisAvailable()) {
    console.warn('⚠️ Redis no disponible para flush');
    return;
  }

  try {
    await redisClient.flushDb();
    console.log('🗑️ Redis: Caché limpiado completamente');
  } catch (error) {
    console.error('❌ Error limpiando caché:', error.message);
  }
};

/**
 * Obtener estadísticas de Redis
 * @returns {Promise<Object>} Estadísticas del servidor
 */
const getRedisStats = async () => {
  if (!isRedisAvailable()) {
    return { available: false };
  }

  try {
    const info = await redisClient.info('stats');
    const dbSize = await redisClient.dbSize();
    const memory = await redisClient.info('memory');
    
    return {
      available: true,
      dbSize,
      info,
      memory
    };
  } catch (error) {
    console.error('❌ Error obteniendo stats de Redis:', error.message);
    return { available: false, error: error.message };
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisAvailable,
  disconnectRedis,
  flushCache,
  getRedisStats
};
