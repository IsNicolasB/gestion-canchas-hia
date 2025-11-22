const express = require('express');
const router = express.Router();
const PagoController = require('../controllers/PagoController');

router.post('/mercadopago', PagoController.crearPagoMercadoPago);
router.post('/', PagoController.crearPago);
router.get('/', PagoController.obtenerPagos);
router.get('/:id', PagoController.obtenerPagoPorId);
router.put('/:id', PagoController.actualizarPago);
router.delete('/:id', PagoController.eliminarPago);
router.post('/webhook', PagoController.webhookMercadoPago);
router.get('/cliente/:clienteId', PagoController.obtenerPagosPorCliente);

module.exports = router;