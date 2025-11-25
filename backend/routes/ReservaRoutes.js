const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// POST no usa caché
router.post('/', ReservaController.crearReserva);

// GET con caché (reservas cambian frecuentemente)
router.get('/', cacheMiddleware(120), ReservaController.obtenerReservas); // 2 minutos
router.get('/buscar', cacheMiddleware(60), ReservaController.obtenerReservasPorClienteYFecha); // 1 minuto
router.get('/:id', cacheMiddleware(180), ReservaController.obtenerReservaPorId); // 3 minutos
router.get('/cliente/:clienteId', cacheMiddleware(120), ReservaController.obtenerReservasPorCliente); // 2 minutos

// PUT/DELETE no usan caché
router.put('/:id', ReservaController.actualizarReserva);
router.delete('/:id', ReservaController.eliminarReserva);

module.exports = router;