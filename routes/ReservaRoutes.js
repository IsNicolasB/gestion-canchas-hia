const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');

router.post('/', ReservaController.crearReserva);
router.get('/', ReservaController.obtenerReservas);
router.get('/buscar', ReservaController.obtenerReservasPorClienteYFecha);
router.get('/:id', ReservaController.obtenerReservaPorId);
router.put('/:id', ReservaController.actualizarReserva);
router.delete('/:id', ReservaController.eliminarReserva);
router.get('/cliente/:clienteId', ReservaController.obtenerReservasPorCliente);

module.exports = router;