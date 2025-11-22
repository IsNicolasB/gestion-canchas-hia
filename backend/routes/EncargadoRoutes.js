const express = require('express');
const router = express.Router();
const EncargadoController = require('../controllers/EncargadoController');

router.post('/', EncargadoController.crearEncargado);
router.get('/', EncargadoController.obtenerEncargados);
router.get('/:id', EncargadoController.obtenerEncargadoPorId);
router.put('/:id', EncargadoController.actualizarEncargado);
router.delete('/:id', EncargadoController.eliminarEncargado);

module.exports = router;