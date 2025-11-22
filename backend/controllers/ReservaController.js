const Reserva = require('../models/Reserva');
const Cliente = require('../models/Cliente');

// Crear una nueva reserva (POST)
const crearReserva = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Crear una nueva reserva'
    #swagger.description = 'Crea una reserva nueva en la base de datos.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos de la reserva a crear',
      required: true,
      schema: { $ref: '#/definitions/Reserva' }
    }
    #swagger.responses[201] = {
      description: 'Reserva creada exitosamente',
      schema: { $ref: '#/definitions/Reserva' }
    }
  */
  try {
    const nuevaReserva = new Reserva(req.body);
    const reservaGuardada = await nuevaReserva.save();
    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: reservaGuardada
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las reservas (GET)
const obtenerReservas = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Obtener todas las reservas'
    #swagger.description = 'Retorna una lista de todas las reservas registradas.'
    #swagger.responses[200] = {
      description: 'Lista de reservas obtenida con éxito.',
      schema: { $ref: '#/definitions/Reserva' }
    }
  */
  try {
    const reservas = await Reserva.find()
      .populate('horariosReservados')
      .populate('cancha')
      .populate('cliente')
      .populate('pago');
    res.status(200).json({
      success: true,
      message: 'Reservas recuperadas exitosamente',
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una reserva por ID (GET)
const obtenerReservaPorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Obtener una reserva por ID'
    #swagger.parameters['id'] = { description: 'ID de la reserva', required: true }
    #swagger.responses[200] = {
      description: 'Reserva encontrada',
      schema: { $ref: '#/definitions/Reserva' }
    }
    #swagger.responses[404] = { description: 'Reserva no encontrada' }
  */
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('horariosReservados')
      .populate('cancha')
      .populate('cliente')
      .populate('pago');
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reserva encontrada',
      data: reserva
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una reserva (PUT)
const actualizarReserva = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Actualizar una reserva'
    #swagger.parameters['id'] = { description: 'ID de la reserva', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos de la reserva a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Reserva' }
    }
    #swagger.responses[200] = {
      description: 'Reserva actualizada exitosamente',
      schema: { $ref: '#/definitions/Reserva' }
    }
    #swagger.responses[404] = { description: 'Reserva no encontrada' }
  */
  try {
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reservaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      data: reservaActualizada
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una reserva (DELETE)
const eliminarReserva = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Eliminar una reserva'
    #swagger.parameters['id'] = { description: 'ID de la reserva', required: true }
    #swagger.responses[200] = { description: 'Reserva eliminada exitosamente' }
    #swagger.responses[404] = { description: 'Reserva no encontrada' }
  */
  try {
    const reservaEliminada = await Reserva.findByIdAndDelete(req.params.id);
    if (!reservaEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reserva eliminada exitosamente',
      data: reservaEliminada
    });
  } catch (error) {
    next(error);
  }
};

// Obtener reservas por nombre de cliente y fecha (GET)
const obtenerReservasPorClienteYFecha = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Obtener reservas por nombre de cliente y fecha'
    #swagger.description = 'Retorna las reservas de un cliente para una fecha específica'
    #swagger.parameters['nombre'] = { description: 'Nombre del cliente' }
    #swagger.parameters['fecha'] = { description: 'Fecha en formato YYYY-MM-DD', required: false }
  */
  try {
    const { nombre } = req.query;
    let { fecha } = req.query;
    
    // Si no se proporciona fecha, usar la fecha actual
    if (!fecha) {
      const today = new Date();
      fecha = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }

    const clientes = await Cliente.find({
      $or: [
        { nombre: { $regex: nombre, $options: 'i' } },
        { apellido: { $regex: nombre, $options: 'i' } },
        { 
          $expr: {
            $regexMatch: {
              input: { $concat: ["$nombre", " ", "$apellido"] },
              regex: nombre,
              options: 'i'
            }
          }
        }
      ]
    }).select('_id');

    const clienteIds = clientes.map(c => c._id);

    const reservas = await Reserva.find({
      fecha,
      cliente: { $in: clienteIds }
    })
    .populate('cliente', 'nombre apellido telefono')
    .populate('cancha', 'nombre')
    .populate('pago')
    .sort({ horaInicio: 1 });

    res.status(200).json({
      success: true,
      message: 'Reservas encontradas',
      data: reservas
    });
  } catch (error) {
    next(error);
  }
};

// Obtener reservas por cliente (GET)
const obtenerReservasPorCliente = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Obtener reservas por cliente'
    #swagger.parameters['clienteId'] = { description: 'ID del cliente', required: true }
    #swagger.responses[200] = {
      description: 'Reservas del cliente obtenidas con éxito.',
      schema: { $ref: '#/definitions/Reserva' }
    }
  */
  try {
    const { clienteId } = req.params;
    const reservas = await Reserva.find({ cliente: clienteId })
      .populate('horariosReservados')
      .populate('cancha')
      .populate('pago')
      .sort({ fecha: -1 });
    res.status(200).json(reservas);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  eliminarReserva,
  obtenerReservasPorClienteYFecha,
  obtenerReservasPorCliente
};