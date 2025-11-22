const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  horariosReservados: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Horario' 
  }],
  cancha: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cancha' 
  },
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cliente' 
  },
  fecha: { 
    type: String 
  },
  horaInicio: { 
    type: String 
  },
  horaFin: { 
    type: String 
  },
  pago: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pago'
  }
});

const Reserva = mongoose.model('Reserva', reservaSchema);

module.exports = Reserva;