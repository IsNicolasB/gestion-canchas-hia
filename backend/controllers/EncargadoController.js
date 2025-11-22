const Encargado = require('../models/Encargado');
const bcrypt = require('bcrypt');

// Crear un nuevo encargado (POST)
const crearEncargado = async (req, res, next) => {
  /*
    #swagger.tags = ['Encargados']
    #swagger.summary = 'Crear un nuevo encargado'
    #swagger.description = 'Crea un encargado nuevo en la base de datos.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del encargado a crear',
      required: true,
      schema: { $ref: '#/definitions/Encargado' }
    }
    #swagger.responses[201] = {
      description: 'Encargado creado exitosamente',
      schema: { $ref: '#/definitions/Encargado' }
    }
  */
  try {
    // Verificar si el correo ya está registrado
    const existe = await Encargado.findOne({ correo: req.body.correo });
    if (existe) {
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    // Hashear la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    req.body.contraseña = await bcrypt.hash(req.body.contraseña, salt);

    // Asegurar tipo Encargado
    req.body.tipo = 'Encargado';

    const nuevoEncargado = new Encargado(req.body);
    const encargadoGuardado = await nuevoEncargado.save();
    res.status(201).json({
      success: true,
      message: 'Encargado creado exitosamente',
      data: encargadoGuardado
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los encargados (GET)
const obtenerEncargados = async (req, res, next) => {
  /*
    #swagger.tags = ['Encargados']
    #swagger.summary = 'Obtener todos los encargados'
    #swagger.description = 'Retorna una lista de todos los encargados registrados.'
    #swagger.responses[200] = {
      description: 'Lista de encargados obtenida con éxito.',
      schema: { $ref: '#/definitions/Encargado' }
    }
  */
  try {
    const encargados = await Encargado.find();
    res.status(200).json({
      success: true,
      message: 'Encargados recuperados exitosamente',
      count: encargados.length,
      data: encargados
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un encargado por ID (GET)
const obtenerEncargadoPorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Encargados']
    #swagger.summary = 'Obtener un encargado por ID'
    #swagger.parameters['id'] = { description: 'ID del encargado', required: true }
    #swagger.responses[200] = {
      description: 'Encargado encontrado',
      schema: { $ref: '#/definitions/Encargado' }
    }
    #swagger.responses[404] = { description: 'Encargado no encontrado' }
  */
  try {
    const encargado = await Encargado.findById(req.params.id);
    if (!encargado) {
      return res.status(404).json({
        success: false,
        message: 'Encargado no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Encargado encontrado',
      data: encargado
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un encargado (PUT)
const actualizarEncargado = async (req, res, next) => {
  /*
    #swagger.tags = ['Encargados']
    #swagger.summary = 'Actualizar un encargado'
    #swagger.parameters['id'] = { description: 'ID del encargado', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del encargado a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Encargado' }
    }
    #swagger.responses[200] = {
      description: 'Encargado actualizado exitosamente',
      schema: { $ref: '#/definitions/Encargado' }
    }
    #swagger.responses[404] = { description: 'Encargado no encontrado' }
  */
  try {
    const encargadoActualizado = await Encargado.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!encargadoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Encargado no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Encargado actualizado exitosamente',
      data: encargadoActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un encargado (DELETE)
const eliminarEncargado = async (req, res, next) => {
  /*
    #swagger.tags = ['Encargados']
    #swagger.summary = 'Eliminar un encargado'
    #swagger.parameters['id'] = { description: 'ID del encargado', required: true }
    #swagger.responses[200] = { description: 'Encargado eliminado exitosamente' }
    #swagger.responses[404] = { description: 'Encargado no encontrado' }
  */
  try {
    const encargadoEliminado = await Encargado.findByIdAndDelete(req.params.id);
    if (!encargadoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Encargado no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Encargado eliminado exitosamente',
      data: encargadoEliminado
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearEncargado,
  obtenerEncargados,
  obtenerEncargadoPorId,
  actualizarEncargado,
  eliminarEncargado
};