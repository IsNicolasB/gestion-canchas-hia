const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("989381766185-qqun9sbv6qk03guuar3n1inlps1cegbn.apps.googleusercontent.com");
const axios = require('axios');

// Función para verificar el captcha
async function verificarCaptcha(token) {
  const secretKey = '6LehQHorAAAAAMsjcW0GjEQ0Fq5y6YQx4rX21bIE';
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  
  try {
    const response = await axios.post(url);
    return response.data.success;
  } catch (error) {
    console.error('Error verificando captcha:', error);
    return false;
  }
}
// Crear un nuevo usuario (POST)
const crearUsuario = async (req, res, next) => {
  try {
    const { captchaToken, ...datosUsuario } = req.body;
    
    // Validar captcha
    if (!captchaToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Captcha no resuelto' 
      });
    }
    
    const captchaValido = await verificarCaptcha(captchaToken);
    if (!captchaValido) {
      return res.status(400).json({ 
        success: false, 
        message: 'Captcha inválido' 
      });
    }

    // Verificar que no exista otro usuario con ese correo
    const existe = await Usuario.findOne({ correo: datosUsuario.correo });
    if (existe) {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo ya está registrado' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    datosUsuario.contraseña = await bcrypt.hash(datosUsuario.contraseña, salt);
    datosUsuario.proveedor = 'manual';

    const nuevoUsuario = new Usuario(datosUsuario);
    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuarioGuardado
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los usuarios (GET)
const obtenerUsuarios = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Obtener todos los usuarios'
    #swagger.description = 'Retorna una lista de todos los usuarios registrados.'
    #swagger.responses[200] = {
      description: 'Lista de usuarios obtenida con éxito.',
      schema: { $ref: '#/definitions/Usuario' }
    }
  */
  try {
    const usuarios = await Usuario.find();
    res.status(200).json({
      success: true,
      message: 'Usuarios recuperados exitosamente',
      count: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID (GET)
const obtenerUsuarioPorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Obtener un usuario por ID'
    #swagger.parameters['id'] = { description: 'ID del usuario', required: true }
    #swagger.responses[200] = {
      description: 'Usuario encontrado',
      schema: { $ref: '#/definitions/Usuario' }
    }
    #swagger.responses[404] = { description: 'Usuario no encontrado' }
  */
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Usuario encontrado',
      data: usuario
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario (PUT)
const actualizarUsuario = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Actualizar un usuario'
    #swagger.parameters['id'] = { description: 'ID del usuario', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del usuario a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Usuario' }
    }
    #swagger.responses[200] = {
      description: 'Usuario actualizado exitosamente',
      schema: { $ref: '#/definitions/Usuario' }
    }
    #swagger.responses[404] = { description: 'Usuario no encontrado' }
  */
  try {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario (DELETE)
const eliminarUsuario = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Eliminar un usuario'
    #swagger.parameters['id'] = { description: 'ID del usuario', required: true }
    #swagger.responses[200] = { description: 'Usuario eliminado exitosamente' }
    #swagger.responses[404] = { description: 'Usuario no encontrado' }
  */
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: usuarioEliminado
    });
  } catch (error) {
    next(error);
  }
};

const loginUsuario = async (req, res) => {
  const { correo, contraseña, captchaToken } = req.body;

  try {
    // Validar captcha
    if (!captchaToken) {
      return res.status(400).json({ 
        status: 0, 
        msg: 'Captcha no resuelto' 
      });
    }
    
    const captchaValido = await verificarCaptcha(captchaToken);
    if (!captchaValido) {
      return res.status(400).json({ 
        status: 0, 
        msg: 'Captcha inválido' 
      });
    }

    const usuario = await Usuario.findOne({ correo });

    if (!usuario || usuario.proveedor !== 'manual') {
      return res.status(401).json({ 
        status: 0, 
        msg: "Usuario no encontrado o no válido para login manual" 
      });
    }

    const validPass = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!validPass) {
      return res.status(401).json({ 
        status: 0, 
        msg: "Contraseña incorrecta" 
      });
    }

    res.json({
      status: 1,
      msg: "Login exitoso",
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      telefono: usuario.telefono || '',
      tipo: usuario.tipo,
      userid: usuario._id
    });
  } catch (error) {
    res.status(500).json({ status: 0, msg: "Error interno del servidor" });
  }
};

const loginConGoogle = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: "989381766185-qqun9sbv6qk03guuar3n1inlps1cegbn.apps.googleusercontent.com"
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const nombre = payload.given_name;
    const apellido = payload.family_name || "";

    let usuario = await Usuario.findOne({ correo: email });

    if (!usuario) {
      usuario = new Usuario({
        nombre,
        apellido,
        correo: email,
        contraseña: '-', // no se usa
        proveedor: 'google',
        tipo: 'Cliente',
        telefono: 'sin-telefono'
      });
      await usuario.save();
    }

    res.json({
      status: 1,
      msg: 'Login con Google exitoso',
      nombre: usuario.nombre,
      correo: usuario.correo,
      tipo: usuario.tipo,
      userid: usuario._id
    });

  } catch (error) {
    console.error('Error en loginConGoogle:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido de Google'
    });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  loginUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginConGoogle
};