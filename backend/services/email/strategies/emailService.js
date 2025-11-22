const nodemailer = require('nodemailer');
const emailFactory = require('./emailFactory');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreo(type, data) {
  const strategy = emailFactory(type, data);
  const emailOptions = strategy.getEmailOptions();

  try {
    await transporter.sendMail(emailOptions);
    console.log(`✅ Correo enviado a ${emailOptions.to}`);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    throw new Error('No se pudo enviar el correo electrónico');
  }
}

module.exports = enviarCorreo;
