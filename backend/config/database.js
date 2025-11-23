// config/database.js - Configuración unificada: Failover + Connection Pooling
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Opciones unificadas: Failover + Pooling
    const mongooseOptions = {
      // ========================================
      // CONFIGURACIÓN DE REPLICA SET Y FAILOVER
      // ========================================
      replicaSet: process.env.MONGODB_REPLICA_SET || 'rs0',
      readPreference: 'primaryPreferred', // Lee del primario, si falla usa secundarios
      
      // Timeouts optimizados para failover rápido
      serverSelectionTimeoutMS: 5000,     // 5 segundos para seleccionar servidor
      socketTimeoutMS: 360000,             // 6 minutos timeout de socket
      heartbeatFrequencyMS: 2000,          // Verifica salud cada 2 segundos
      waitQueueTimeoutMS: 10000,           // Timeout para obtener conexión del pool
      
      // ========================================
      // CONNECTION POOLING
      // ========================================
      maxPoolSize: parseInt(process.env.MONGOOSE_MAX_POOL_SIZE) || 50,
      minPoolSize: parseInt(process.env.MONGOOSE_MIN_POOL_SIZE) || 10,
      maxIdleTimeMS: parseInt(process.env.MONGOOSE_MAX_IDLE_TIME_MS) || 60000,
      
      // ========================================
      // OPCIONES DE ESCRITURA
      // ========================================
      retryWrites: true,
      w: process.env.NODE_ENV === 'production' ? 1 : 'majority', // w=1 para desarrollo (más rápido)
      
      // ========================================
      // OTRAS OPCIONES
      // ========================================
      family: 4, // Usar IPv4
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📂 Base de datos: ${conn.connection.name}`);
    console.log(`🔗 Replica Set: ${mongooseOptions.replicaSet} con failover automático`);
    console.log(`🔄 Pool de conexiones: Min=${mongooseOptions.minPoolSize}, Max=${mongooseOptions.maxPoolSize}`);
    
  } catch (error) {
    console.error('❌ Error inicial de conexión a MongoDB:', error.message);
    console.log('🔄 Mongoose reintentará conectar automáticamente...');
    // NO hacer process.exit(1) para permitir reconexión automática en producción
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1); // Solo salir en desarrollo para debug
    }
  }
};

// ========================================
// EVENT LISTENERS PARA FAILOVER
// ========================================

mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose conectado a MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
  console.log('🔄 Mongoose intentará reconectar automáticamente...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ Mongoose RECONECTADO a MongoDB (posible failover)');
  console.log(`🔗 Nuevo host: ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error en MongoDB:', err.message);
  // No terminar el proceso, dejar que Mongoose maneje la reconexión
});

// Evento cuando el Replica Set está completamente configurado
mongoose.connection.on('fullsetup', () => {
  console.log('🔄 Replica Set completamente configurado y listo');
});

// Evento cuando todos los servidores están conectados
mongoose.connection.on('all', () => {
  console.log('✅ Todos los nodos del Replica Set están disponibles');
});

// ========================================
// FUNCIÓN DE ESTADÍSTICAS DEL POOL
// ========================================

/**
 * Obtiene estadísticas del pool de conexiones y estado del Replica Set
 * @returns {Object} Estadísticas del pool y servidores
 */
const getPoolStats = () => {
  const client = mongoose.connection.getClient();

  if (!client) {
    return {
      error: 'Base de datos no conectada',
      status: 'disconnected',
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Obtener descripciones de servidores (servers es un objeto, no array)
    const serversObj = client.topology?.description?.servers || {};
    const serverDescriptions = Object.values(serversObj);

    // Estado de conexión
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: connectionStates[mongoose.connection.readyState] || 'unknown',
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      },
      poolConfig: {
        minPoolSize: parseInt(process.env.MONGOOSE_MIN_POOL_SIZE) || 10,
        maxPoolSize: parseInt(process.env.MONGOOSE_MAX_POOL_SIZE) || 50,
        maxIdleTimeMS: parseInt(process.env.MONGOOSE_MAX_IDLE_TIME_MS) || 60000,
      },
      replicaSet: {
        name: process.env.MONGODB_REPLICA_SET || 'rs0',
        readPreference: 'primaryPreferred',
        servers: serverDescriptions.map(server => ({
          host: server.address,
          type: server.type,
          state: server.type // PRIMARY, SECONDARY, etc.
        }))
      },
      topology: {
        type: client.topology?.description?.type || 'Unknown',
        setName: client.topology?.description?.setName || null
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: 'Error al obtener estadísticas del pool',
      message: error.message,
      status: 'error',
      timestamp: new Date().toISOString()
    };
  }
};

// ========================================
// MANEJO DE CIERRE GRACEFUL
// ========================================

const gracefulShutdown = async (signal) => {
  console.log(`\n📢 Señal ${signal} recibida`);
  try {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar conexión:', err.message);
    process.exit(1);
  }
};

// Cerrar conexión cuando se termina la aplicación
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  // No terminar el proceso para permitir que la app continúe
});

// ========================================
// EXPORTACIONES
// ========================================

module.exports = {
  connectDB,
  getPoolStats
};