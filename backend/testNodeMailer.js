const enviarCorreo = require('./services/email/strategies/emailService');

const datos = {
  nombre: 'Juan Pérez',
  cancha: 'Cancha 3',
  fecha: '2025-07-05',
  horaInicio: '18:00',
  email: 'mendezjulieta4@gmail.com'
};

enviarCorreo('recordatorio', datos)
  .then(() => console.log('Correo de prueba enviado.'))
  .catch(err => console.error('Error al enviar correo de prueba:', err));