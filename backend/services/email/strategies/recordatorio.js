const fs = require('fs');
const path = require('path');
const BaseEmailStrategy = require('./baseStrategy');

class RecordatorioReserva extends BaseEmailStrategy {
  getEmailOptions() {
    const templatePath = path.join(__dirname, '../../../template/emailRecordatorio.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    html = html
      .replace('{{nombre}}', this.data.nombre)
      .replace('{{cancha}}', this.data.cancha)
      .replace('{{fecha}}', this.data.fecha)
      .replace('{{horaInicio}}', this.data.horaInicio);

    return {
      from: `"Reserva de Cancha ⚽" <${process.env.EMAIL_USER}>`,
      to: this.data.to,
      subject: '⏰ Recordatorio de tu reserva',
      html,
    };
  }
}

module.exports = RecordatorioReserva;
