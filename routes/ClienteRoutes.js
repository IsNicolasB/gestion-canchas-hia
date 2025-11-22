const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');

router.post('/', ClienteController.crearCliente);
router.get('/buscar', ClienteController.buscarClientePorNombreApellido);
router.get('/', ClienteController.obtenerClientes);
router.get('/:id', ClienteController.obtenerClientePorId);
router.put('/:id', ClienteController.actualizarCliente);
router.delete('/:id', ClienteController.eliminarCliente);
router.put('/:id/cambiar-password', ClienteController.cambiarPassword);

module.exports = router;