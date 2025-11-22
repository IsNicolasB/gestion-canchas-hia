const Cancha = require('../models/Cancha');

// Crear una nueva cancha (POST)
const crearCancha = async (req, res, next) => {
  /*
    #swagger.tags = ['Canchas']
    #swagger.summary = 'Crear una nueva cancha'
    #swagger.description = 'Crea una cancha nueva en la base de datos.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos de la cancha a crear',
      required: true,
      schema: { $ref: '#/definitions/Cancha' }
    }
    #swagger.responses[201] = {
      description: 'Cancha creada exitosamente',
      schema: { $ref: '#/definitions/Cancha' }
    }
  */
  try {
    const nuevaCancha = new Cancha(req.body);
    const canchaGuardada = await nuevaCancha.save();
    res.status(201).json({
      success: true,
      message: 'Cancha creada exitosamente',
      data: canchaGuardada
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las canchas (GET)
const obtenerCanchas = async (req, res, next) => {
  /*
    #swagger.tags = ['Canchas']
    #swagger.summary = 'Obtener todas las canchas'
    #swagger.description = 'Retorna una lista de todas las canchas registradas.'
    #swagger.responses[200] = {
      description: 'Lista de canchas obtenida con éxito.',
      schema: { $ref: '#/definitions/Cancha' }
    }
  */
  try {
    const canchas = await Cancha.find();
    res.status(200).json({
      success: true,
      message: 'Canchas recuperadas exitosamente',
      count: canchas.length,
      data: canchas
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una cancha por ID (GET)
const obtenerCanchaPorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Canchas']
    #swagger.summary = 'Obtener una cancha por ID'
    #swagger.parameters['id'] = { description: 'ID de la cancha', required: true }
    #swagger.responses[200] = {
      description: 'Cancha encontrada',
      schema: { $ref: '#/definitions/Cancha' }
    }
    #swagger.responses[404] = { description: 'Cancha no encontrada' }
  */
  try {
    const cancha = await Cancha.findById(req.params.id);
    if (!cancha) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Cancha encontrada',
      data: cancha
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una cancha (PUT)
const actualizarCancha = async (req, res, next) => {
  /*
    #swagger.tags = ['Canchas']
    #swagger.summary = 'Actualizar una cancha'
    #swagger.parameters['id'] = { description: 'ID de la cancha', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos de la cancha a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Cancha' }
    }
    #swagger.responses[200] = {
      description: 'Cancha actualizada exitosamente',
      schema: { $ref: '#/definitions/Cancha' }
    }
    #swagger.responses[404] = { description: 'Cancha no encontrada' }
  */
  try {
    const canchaActualizada = await Cancha.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!canchaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Cancha actualizada exitosamente',
      data: canchaActualizada
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una cancha (DELETE)
const eliminarCancha = async (req, res, next) => {
  /*
    #swagger.tags = ['Canchas']
    #swagger.summary = 'Eliminar una cancha'
    #swagger.parameters['id'] = { description: 'ID de la cancha', required: true }
    #swagger.responses[200] = { description: 'Cancha eliminada exitosamente' }
    #swagger.responses[404] = { description: 'Cancha no encontrada' }
  */
  try {
    const canchaEliminada = await Cancha.findByIdAndDelete(req.params.id);
    if (!canchaEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Cancha no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Cancha eliminada exitosamente',
      data: canchaEliminada
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearCancha,
  obtenerCanchas,
  obtenerCanchaPorId,
  actualizarCancha,
  eliminarCancha
};