const RecordatorioReserva = require('./recordatorio');

function emailFactory(type, data) {
  switch (type) {
    case 'recordatorio':
      return new RecordatorioReserva(data);
    default:
      throw new Error('Tipo de correo no soportado: ' + type);
  }
}

module.exports = emailFactory;
