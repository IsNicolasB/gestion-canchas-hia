const express = require('express');
const router = express.Router();
const CanchaController = require('../controllers/CanchaController');

router.post('/', CanchaController.crearCancha);
router.get('/', CanchaController.obtenerCanchas);
router.get('/:id', CanchaController.obtenerCanchaPorId);
router.put('/:id', CanchaController.actualizarCancha);
router.delete('/:id', CanchaController.eliminarCancha);

module.exports = router;