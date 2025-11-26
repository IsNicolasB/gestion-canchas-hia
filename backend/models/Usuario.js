const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, index: true },
  apellido: { type: String, required: true, index: true },
  correo: { type: String, required: true, unique: true },
  contraseña: {
    type: String,
    required: function () {
      return this.proveedor !== 'google';
    }
  },
  proveedor: {
    type: String,
    enum: ['manual', 'google'],
    default: 'manual'
  }
}, {
  discriminatorKey: 'tipo',
  collection: 'usuarios'
});

// Índices compuestos para optimizar búsquedas
usuarioSchema.index({ tipo: 1, apellido: 1 });
usuarioSchema.index({ tipo: 1, nombre: 1 });
usuarioSchema.index({ tipo: 1, correo: 1 });

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;
