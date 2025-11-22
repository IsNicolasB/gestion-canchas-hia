const express = require('express');
const router = express.Router();
const HorarioController = require('../controllers/HorarioController');

router.post('/', HorarioController.crearHorario);
router.get('/', HorarioController.obtenerHorarios);
router.get('/filtrar', HorarioController.obtenerHorariosPorCanchaYFecha); // <-- Añadido aquí
router.get('/:id', HorarioController.obtenerHorarioPorId);
router.put('/:id', HorarioController.actualizarHorario);
router.delete('/:id', HorarioController.eliminarHorario);

module.exports = router;