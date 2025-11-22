const { mercadopago, Preference } = require('../config/mercadopago');
const Pago = require('../models/Pago');
const Reserva = require('../models/Reserva');
const Horario = require('../models/Horario');
const axios = require('axios');
const mongoose = require('mongoose');

// Crear un nuevo pago (POST)
const crearPago = async (req, res, next) => {
  /*
    #swagger.tags = ['Pagos']
    #swagger.summary = 'Crear un nuevo pago'
    #swagger.description = 'Crea un pago nuevo en la base de datos.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del pago a crear',
      required: true,
      schema: { $ref: '#/definitions/Pago' }
    }
    #swagger.responses[201] = {
      description: 'Pago creado exitosamente',
      schema: { $ref: '#/definitions/Pago' }
    }
  */
  try {
    const nuevoPago = new Pago(req.body);
    const pagoGuardado = await nuevoPago.save();
    res.status(201).json({
      success: true,
      message: 'Pago creado exitosamente',
      data: pagoGuardado
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los pagos (GET)
const obtenerPagos = async (req, res, next) => {
  /*
    #swagger.tags = ['Pagos']
    #swagger.summary = 'Obtener todos los pagos'
    #swagger.description = 'Retorna una lista de todos los pagos registrados.'
    #swagger.responses[200] = {
      description: 'Lista de pagos obtenida con éxito.',
      schema: { $ref: '#/definitions/Pago' }
    }
  */
  try {
    const pagos = await Pago.find();
    res.status(200).json({
      success: true,
      message: 'Pagos recuperados exitosamente',
      count: pagos.length,
      data: pagos
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un pago por ID (GET)
const obtenerPagoPorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Pagos']
    #swagger.summary = 'Obtener un pago por ID'
    #swagger.parameters['id'] = { description: 'ID del pago', required: true }
    #swagger.responses[200] = {
      description: 'Pago encontrado',
      schema: { $ref: '#/definitions/Pago' }
    }
    #swagger.responses[404] = { description: 'Pago no encontrado' }
  */
  try {
    const pago = await Pago.findById(req.params.id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Pago encontrado',
      data: pago
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un pago (PUT)
const actualizarPago = async (req, res, next) => {
  /*
    #swagger.tags = ['Pagos']
    #swagger.summary = 'Actualizar un pago'
    #swagger.parameters['id'] = { description: 'ID del pago', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del pago a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Pago' }
    }
    #swagger.responses[200] = {
      description: 'Pago actualizado exitosamente',
      schema: { $ref: '#/definitions/Pago' }
    }
    #swagger.responses[404] = { description: 'Pago no encontrado' }
  */
  try {
    const pagoActualizado = await Pago.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!pagoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Pago actualizado exitosamente',
      data: pagoActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un pago (DELETE)
const eliminarPago = async (req, res, next) => {
  /*
    #swagger.tags = ['Pagos']
    #swagger.summary = 'Eliminar un pago'
    #swagger.parameters['id'] = { description: 'ID del pago', required: true }
    #swagger.responses[200] = { description: 'Pago eliminado exitosamente' }
    #swagger.responses[404] = { description: 'Pago no encontrado' }
  */
  try {
    const pagoEliminado = await Pago.findByIdAndDelete(req.params.id);
    if (!pagoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Pago eliminado exitosamente',
      data: pagoEliminado
    });
  } catch (error) {
    next(error);
  }
};

// Crear pago en Mercado Pago (POST)
const crearPagoMercadoPago = async (req, res, next) => {
  /*
    #swagger.tags = ['Pagos']
    #swagger.summary = 'Crear pago en Mercado Pago'
    #swagger.description = 'Crea un pago utilizando la API de Mercado Pago.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del pago en Mercado Pago',
      required: true,
      schema: {
        type: 'object',
        properties: {
          importeTotal: { type: 'number' },
          descripcion: { type: 'string' }
        },
        required: ['importeTotal']
      }
    }
    #swagger.responses[201] = {
      description: 'Pago en Mercado Pago creado exitosamente',
      schema: {
        type: 'object',
        properties: {
          pago: { $ref: '#/definitions/Pago' },
          mp_init_point: { type: 'string' }
        }
      }
    }
  */
  try {
    const { importeTotal, descripcion } = req.body;
    // Crear preferencia de pago en Mercado Pago
    if (!importeTotal || isNaN(importeTotal) || importeTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El importe total es requerido y debe ser un número positivo'
      });
    }

    const importeSenia = 0.3 * importeTotal; // 30% del total
    const importeRestante = importeTotal - importeSenia;

    const pagoId = new mongoose.Types.ObjectId(); // Genera un nuevo ID para el pago
    const preference = {
      items: [
        {
          title: descripcion || 'Reserva de cancha',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Number(importeSenia)
        }
      ],
      notification_url: 'https://proybackendgrupo04.onrender.com/pagos/webhook',
      external_reference: pagoId.toString()

    };    
    console.log('Access Token:', process.env.MP_ACCESS_TOKEN);
    console.log('Preference:', preference);

    let mpResponse;
    try {
      mpResponse = await new Preference(mercadopago).create({ body: preference });
      console.log('mpResponse:', mpResponse);
    } catch (err) {
      console.error('Error al crear preferencia:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al crear preferencia de Mercado Pago',
        error: err.message
      });
    }


    // Usa la propiedad correcta según lo que imprima el log:
    const preferenceId = mpResponse.id || (mpResponse.body && mpResponse.body.id);
    const initPoint = mpResponse.init_point || (mpResponse.body && mpResponse.body.init_point);

    if (!preferenceId || !initPoint) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo obtener el link de pago de Mercado Pago',
        data: mpResponse
      });
    }

    const nuevoPago = new Pago({
      _id: pagoId,
      importeTotal,
      importePendiente: importeTotal,
      estado: 'pendiente',
      mp_preference_id: preferenceId,
      external_reference: pagoId.toString(),
      cancha: req.body.cancha,
      cliente: req.body.cliente,
      fecha: req.body.fecha,
      horaInicio: req.body.horaInicio,
      horaFin: req.body.horaFin
    });
    const pagoGuardado = await nuevoPago.save();

    res.status(201).json({
      success: true,
      message: 'Pago y preferencia creados',
      data: {
        pago: pagoGuardado,
        mp_init_point: initPoint
      }
    });
  } catch (error) {
    next(error);
  }
};

webhookMercadoPago = async (req, res) => {
  try {
    console.log('Webhook recibido', req.body);

    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      if (!paymentId) {
        console.error('No se recibió paymentId');
        return res.status(400).send('No paymentId');
      }
      try {
        const response = await axios.get(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
            }
          }
        );
        const payment = response.data;
        console.log('Payment consultado:', payment);

        // Busca el pago en tu base por preference_id
        const pago = await Pago.findOne({ external_reference: payment.external_reference });
        if (pago) {
          if (payment.status === 'approved') {
            pago.importePendiente = Math.max(0, pago.importePendiente - payment.transaction_amount);
            pago.estado = 'señado';

            // 1. Crear o buscar los horarios ocupados para cada bloque
            const horaInicioNum = parseInt(pago.horaInicio.split(':')[0], 10);
            const horaFinNum = parseInt(pago.horaFin.split(':')[0], 10);
            let horarioIds = [];

            for (let h = horaInicioNum; h < horaFinNum; h++) {
              const bloqueInicio = h.toString().padStart(2, '0') + ':00';
              const bloqueFin = (h + 1).toString().padStart(2, '0') + ':00';

              let horario = await Horario.findOne({
                cancha: pago.cancha,
                fecha: pago.fecha,
                horaInicio: bloqueInicio,
                horaFin: bloqueFin
              });

              if (!horario) {
                horario = new Horario({
                  cancha: pago.cancha,
                  fecha: pago.fecha,
                  horaInicio: bloqueInicio,
                  horaFin: bloqueFin,
                  estado: 'ocupado'
                });
                await horario.save();
              }
              horarioIds.push(horario._id);
            }

            // 2. Crear la reserva si no existe
            let reserva = await Reserva.findOne({ pago: pago._id });
            if (!reserva) {
              reserva = new Reserva({
                cancha: pago.cancha,
                cliente: pago.cliente,
                fecha: pago.fecha,
                horaInicio: pago.horaInicio,
                horaFin: pago.horaFin,
                pago: pago._id,
                horariosReservados: horarioIds // <-- Cambia a un array en tu modelo Reserva
              });
              await reserva.save();
            }
          } else {
            pago.estado = payment.status;
          }
          await pago.save();
          console.log('Pago actualizado:', pago);
        } else {
          console.log('No se encontró el pago con ese preference_id');
        }
      } catch (err) {
        console.error('Error consultando pago en Mercado Pago:', err.response?.data || err.message);
        return res.status(500).send('Error consultando pago');
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).send('Error');
  }
};

// Obtener pagos por cliente (GET)
const obtenerPagosPorCliente = async (req, res, next) => {
  /*
    #swagger.tags = ['Pagos']
    #swagger.summary = 'Obtener pagos por cliente'
    #swagger.parameters['clienteId'] = { description: 'ID del cliente', required: true }
    #swagger.responses[200] = {
      description: 'Pagos del cliente obtenidos con éxito.',
      schema: { $ref: '#/definitions/Pago' }
    }
  */
  try {
    const { clienteId } = req.params;
    const pagos = await Pago.find({ cliente: clienteId }).sort({ fecha: -1 });
    res.status(200).json(pagos);
  } catch (error) {
    next(error);
  }
};



module.exports = {
  crearPago,
  obtenerPagos,
  obtenerPagoPorId,
  actualizarPago,
  eliminarPago,
  crearPagoMercadoPago,
  webhookMercadoPago,
  obtenerPagosPorCliente
};