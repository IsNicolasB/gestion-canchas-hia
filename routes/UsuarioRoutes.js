const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

router.post('/registro', UsuarioController.crearUsuario);
router.post('/login', UsuarioController.loginUsuario);
router.post('/login/google', UsuarioController.loginConGoogle);
router.get('/', UsuarioController.obtenerUsuarios);
router.get('/:id', UsuarioController.obtenerUsuarioPorId);
router.put('/:id', UsuarioController.actualizarUsuario);
router.delete('/:id', UsuarioController.eliminarUsuario);

module.exports = router;