const mongoose = require('mongoose');

const canchaSchema = new mongoose.Schema({
  nombre: { type: String, required: true }, // Nuevo atributo
  tipo: { type: String, required: true },
  ubicacion: { type: String, required: true },
  dimensiones: { type: String, required: true },
  imagen: { type: String }, // Puede ser una URL o ruta de imagen
  estado: { type: String, required: true }, // Ejemplo: 'disponible', 'ocupada', etc.
  precioPorHora: { type: Number, required: true } // Nuevo atributo
});

const Cancha = mongoose.model('Cancha', canchaSchema);

module.exports = Cancha;