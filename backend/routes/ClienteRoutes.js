const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// POST no usa caché
router.post('/', ClienteController.crearCliente);

// GET con caché (búsquedas y listados)
router.get('/buscar', cacheMiddleware(120), ClienteController.buscarClientePorNombreApellido); // 2 minutos
router.get('/', ClienteController.obtenerClientes); // 1 minuto
router.get('/:id', cacheMiddleware(300), ClienteController.obtenerClientePorId); // 5 minutos

// PUT/DELETE no usan caché
router.put('/:id', ClienteController.actualizarCliente);
router.delete('/:id', ClienteController.eliminarCliente);
router.put('/:id/cambiar-password', ClienteController.cambiarPassword);

module.exports = router;