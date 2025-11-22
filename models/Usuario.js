const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
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

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;
