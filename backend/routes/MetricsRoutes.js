// routes/MetricsRoutes.js - Rutas para exponer métricas del sistema
const express = require('express');
const router = express.Router();
const { getPoolStats } = require('../config/database');

/**
 * GET /metrics/pool
 * Obtiene estadísticas del pool de conexiones de MongoDB
 */
router.get('/pool', (req, res) => {
  try {
    const poolStats = getPoolStats();

    // Si hubo error en getPoolStats, devolver 500
    if (poolStats.status === 'error') {
      return res.status(500).json(poolStats);
    }

    const statusCode = poolStats.status === 'connected' ? 200 : 503;
    res.status(statusCode).json(poolStats);
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo estadísticas del pool',
      message: error.message
    });
  }
});

/**
 * GET /metrics/health
 * Verificación simple de salud de la API
 */
router.get('/health', (req, res) => {
  try {
    const poolStats = getPoolStats();

    const status = poolStats.status === 'connected' ? 'healthy' : 'unhealthy';
    const statusCode = poolStats.status === 'connected' ? 200 : 503;

    res.status(statusCode).json({
      status,
      database: poolStats.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error verificando salud de la API',
      message: error.message
    });
  }
});

module.exports = router;
