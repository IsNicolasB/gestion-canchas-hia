const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  cancha: { type: mongoose.Schema.Types.ObjectId, ref: 'Cancha', required: true },
  fecha: { type: String, required: true },
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },
  estado: { type: String, default: 'ocupado' }
});

const Horario = mongoose.model('Horario', horarioSchema);

module.exports = Horario;