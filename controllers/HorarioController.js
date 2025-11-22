const Horario = require('../models/Horario');

// Crear un nuevo horario (POST)
const crearHorario = async (req, res, next) => {
  /*
    #swagger.tags = ['Horarios']
    #swagger.summary = 'Crear un nuevo horario'
    #swagger.description = 'Crea un horario nuevo en la base de datos.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del horario a crear',
      required: true,
      schema: { $ref: '#/definitions/Horario' }
    }
    #swagger.responses[201] = {
      description: 'Horario creado exitosamente',
      schema: { $ref: '#/definitions/Horario' }
    }
  */
  try {
    const nuevoHorario = new Horario(req.body);
    const horarioGuardado = await nuevoHorario.save();
    res.status(201).json({
      success: true,
      message: 'Horario creado exitosamente',
      data: horarioGuardado
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los horarios (GET)
const obtenerHorarios = async (req, res, next) => {
  /*
    #swagger.tags = ['Horarios']
    #swagger.summary = 'Obtener todos los horarios'
    #swagger.description = 'Retorna una lista de todos los horarios registrados.'
    #swagger.responses[200] = {
      description: 'Lista de horarios obtenida con éxito.',
      schema: { $ref: '#/definitions/Horario' }
    }
  */
  try {
    const horarios = await Horario.find();
    res.status(200).json({
      success: true,
      message: 'Horarios recuperados exitosamente',
      count: horarios.length,
      data: horarios
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un horario por ID (GET)
const obtenerHorarioPorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Horarios']
    #swagger.summary = 'Obtener un horario por ID'
    #swagger.parameters['id'] = { description: 'ID del horario', required: true }
    #swagger.responses[200] = {
      description: 'Horario encontrado',
      schema: { $ref: '#/definitions/Horario' }
    }
    #swagger.responses[404] = { description: 'Horario no encontrado' }
  */
  try {
    const horario = await Horario.findById(req.params.id);
    if (!horario) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Horario encontrado',
      data: horario
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un horario (PUT)
const actualizarHorario = async (req, res, next) => {
  /*
    #swagger.tags = ['Horarios']
    #swagger.summary = 'Actualizar un horario'
    #swagger.parameters['id'] = { description: 'ID del horario', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del horario a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Horario' }
    }
    #swagger.responses[200] = {
      description: 'Horario actualizado exitosamente',
      schema: { $ref: '#/definitions/Horario' }
    }
    #swagger.responses[404] = { description: 'Horario no encontrado' }
  */
  try {
    const horarioActualizado = await Horario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!horarioActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Horario actualizado exitosamente',
      data: horarioActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un horario (DELETE)
const eliminarHorario = async (req, res, next) => {
  /*
    #swagger.tags = ['Horarios']
    #swagger.summary = 'Eliminar un horario'
    #swagger.parameters['id'] = { description: 'ID del horario', required: true }
    #swagger.responses[200] = { description: 'Horario eliminado exitosamente' }
    #swagger.responses[404] = { description: 'Horario no encontrado' }
  */
  try {
    const horarioEliminado = await Horario.findByIdAndDelete(req.params.id);
    if (!horarioEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Horario eliminado exitosamente',
      data: horarioEliminado
    });
  } catch (error) {
    next(error);
  }
};

// Obtener horarios filtrando por canchaId y fecha (GET)
const obtenerHorariosPorCanchaYFecha = async (req, res, next) => {
  try {
    const { canchaId, fecha } = req.query;
    if (!canchaId || !fecha) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los parámetros canchaId y fecha'
      });
    }

    // Filtra por igualdad de string
    const horarios = await Horario.find({
      cancha: canchaId,
      fecha: fecha
    });

    res.status(200).json({
      success: true,
      message: 'Horarios filtrados recuperados exitosamente',
      count: horarios.length,
      data: horarios
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearHorario,
  obtenerHorarios,
  obtenerHorarioPorId,
  actualizarHorario,
  eliminarHorario,
  obtenerHorariosPorCanchaYFecha
};