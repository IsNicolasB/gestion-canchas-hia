// config/database.js - Configuración de conexión a MongoDB con Connection Pooling
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Opciones de conexión con parámetros de pooling configurados
    const mongooseOptions = {
      maxPoolSize: parseInt(process.env.MONGOOSE_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGOOSE_MIN_POOL_SIZE) || 5,
      maxIdleTimeMS: parseInt(process.env.MONGOOSE_MAX_IDLE_TIME_MS) || 45000,
      replicaSet: process.env.MONGODB_REPLICA_SET || undefined,
      retryWrites: true,
      w: 'majority',
      waitQueueTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📂 Base de datos: ${conn.connection.name}`);
    console.log(`🔄 Pool de conexiones: Min=${mongooseOptions.minPoolSize}, Max=${mongooseOptions.maxPoolSize}`);
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

// Eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error en MongoDB:', err.message);
});

// Cerrar conexión cuando se termina la aplicación
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 Conexión a MongoDB cerrada');
  process.exit(0);
});

// Función para obtener estadísticas del pool de conexiones
const getPoolStats = () => {
  const client = mongoose.connection.getClient();

  if (!client) {
    return {
      error: 'Base de datos no conectada',
      status: 'disconnected'
    };
  }

  try {
    // ⚠️ servers es un objeto, no un array → usamos Object.values()
    const serversObj = client.topology?.description?.servers || {};
    const serverDescriptions = Object.values(serversObj);

    return {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      connectionString: process.env.MONGODB_URI ? 'configurada' : 'no configurada',
      poolConfig: {
        minPoolSize: parseInt(process.env.MONGOOSE_MIN_POOL_SIZE) || 5,
        maxPoolSize: parseInt(process.env.MONGOOSE_MAX_POOL_SIZE) || 10,
        maxIdleTimeMS: parseInt(process.env.MONGOOSE_MAX_IDLE_TIME_MS) || 45000,
      },
      replicaSet: process.env.MONGODB_REPLICA_SET || 'no configurado',
      servers: serverDescriptions.map(server => ({
        host: server.address,
        type: server.type
      })),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: 'Error al obtener estadísticas del pool',
      message: error.message,
      status: 'error'
    };
  }
};

// Exportar ambas funciones en un solo objeto
module.exports = {
  connectDB,
  getPoolStats
};
