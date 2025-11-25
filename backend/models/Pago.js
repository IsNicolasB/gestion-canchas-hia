const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  importeTotal: { type: Number, required: true },
  importePendiente: { type: Number, required: true },
  estado: { type: String, required: true, index: true }, // 'pendiente', 'pagado', etc.
  mp_preference_id: { type: String },
  external_reference: { type: String },
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
  horaInicio: { type: String },
  horaFin: { type: String }
},{
  timestamps: true,
  versionKey: false
}
);

// Índices compuestos para queries optimizadas
pagoSchema.index({ cliente: 1, fecha: -1 });
pagoSchema.index({ estado: 1, cliente: 1, fecha: -1 });
pagoSchema.index({ cancha: 1, estado: 1, fecha: -1 });
pagoSchema.index({ estado: 1, fecha: -1 });

// Índice parcial para pagos confirmados (solo cuando estado='pagado' y hay fecha)
pagoSchema.index(
  { estado: 1, fecha: -1 }, 
  { 
    partialFilterExpression: { 
      estado: 'pagado',
      fecha: { $exists: true, $ne: null, $ne: '' }
    },
    name: 'idx_pagos_pagado_fecha_partial'
  }
);

const Pago = mongoose.model('Pago', pagoSchema);

module.exports = Pago;