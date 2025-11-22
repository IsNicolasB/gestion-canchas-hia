const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  importeTotal: { type: Number, required: true },
  importePendiente: { type: Number, required: true },
  estado: { type: String, required: true }, // 'pendiente', 'pagado', etc.
  mp_preference_id: { type: String },
  external_reference: { type: String },
  cancha: { type: mongoose.Schema.Types.ObjectId, ref: 'Cancha' },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  fecha: { type: String }, // o Date si lo prefieres
  horaInicio: { type: String },
  horaFin: { type: String }
},{
  timestamps: true,
  versionKey: false
}
);

const Pago = mongoose.model('Pago', pagoSchema);

module.exports = Pago;