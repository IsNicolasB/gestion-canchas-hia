// routes/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
  try {
    // Verificar estado de MongoDB
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Obtener información del Replica Set
    const admin = mongoose.connection.db.admin();
    const status = await admin.replSetGetStatus();
    
    const primary = status.members.find(m => m.stateStr === 'PRIMARY');
    
    res.status(dbState === 1 ? 200 : 503).json({
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      database: {
        state: states[dbState],
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      replicaSet: {
        name: status.set,
        primary: primary ? primary.name : 'none',
        members: status.members.map(m => ({
          name: m.name,
          state: m.stateStr,
          health: m.health
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;