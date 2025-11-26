const express = require('express');
const router = express.Router();
const HorarioController = require('../controllers/HorarioController');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// POST no usa caché
router.post('/', HorarioController.crearHorario);

// GET con caché (horarios cambian al hacer reservas)
router.get('/', cacheMiddleware(180), HorarioController.obtenerHorarios); // 3 minutos
router.get('/filtrar', cacheMiddleware(60), HorarioController.obtenerHorariosPorCanchaYFecha); // 1 minuto (crítico)
router.get('/:id', cacheMiddleware(300), HorarioController.obtenerHorarioPorId); // 5 minutos

// PUT/DELETE no usan caché
router.put('/:id', HorarioController.actualizarHorario);
router.delete('/:id', HorarioController.eliminarHorario);

module.exports = router;