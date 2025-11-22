const mongoose = require('mongoose');
const Usuario = require('./Usuario');

const encargadoSchema = new mongoose.Schema({
  legajo: { type: String, required: true }
});

const Encargado = Usuario.discriminator('Encargado', encargadoSchema);

module.exports = Encargado;