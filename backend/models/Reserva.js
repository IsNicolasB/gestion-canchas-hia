const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  horariosReservados: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Horario' 
  }],
  cancha: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cancha',
    index: true
  },
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cliente',
    index: true
  },
  fecha: { 
    type: String,  // NOTA: Debería ser Date, pero mantenemos String por compatibilidad
    index: true
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

// Índices compuestos para queries optimizadas
reservaSchema.index({ cliente: 1, fecha: -1 });
reservaSchema.index({ cancha: 1, fecha: 1 });

const Reserva = mongoose.model('Reserva', reservaSchema);

module.exports = Reserva;