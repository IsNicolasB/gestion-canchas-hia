const express = require('express');
const router = express.Router();
const CanchaController = require('../controllers/CanchaController');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// POST no usa caché
router.post('/', CanchaController.crearCancha);

// GET con caché (canchas raramente cambian)
router.get('/', cacheMiddleware(1800), CanchaController.obtenerCanchas); // 30 minutos
router.get('/:id', cacheMiddleware(600), CanchaController.obtenerCanchaPorId); // 10 minutos

// PUT/DELETE no usan caché
router.put('/:id', CanchaController.actualizarCancha);
router.delete('/:id', CanchaController.eliminarCancha);

module.exports = router;