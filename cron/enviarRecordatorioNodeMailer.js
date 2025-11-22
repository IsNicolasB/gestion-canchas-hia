const cron = require('node-cron');
const Reserva = require('../models/Reserva');
const enviarCorreo = require('../services/email/strategies/emailService');

// Ejecuta todos los días a las 10:00 AM
cron.schedule('* 10 * * *', async () => {
  try {
      console.log('🔔 Iniciando envío de recordatorios...');
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      const fecha = mañana.toISOString().split('T')[0];
  
      // Buscar reservas para mañana, incluyendo la información del cliente y cancha
      const reservas = await Reserva.find({ fecha })
          .populate({
              path: 'cliente',
              select: 'correo nombre apellido',
              options: { strictPopulate: false }
          })
          .populate({
              path: 'cancha',
              select: 'nombre',
              options: { strictPopulate: false }
          });
          
      console.log(`📋 ${reservas.length} reservas encontradas para mañana (${fecha})`);
  
      let enviados = 0;
      let errores = 0;
  
      for (const r of reservas) {
          try {
              // Verificar si el cliente existe y tiene correo
              if (!r.cliente || !r.cliente.correo) {
                  console.warn(`⚠️ Reserva ${r._id} no tiene cliente o correo válido. Cliente: ${JSON.stringify(r.cliente)}`);
                  errores++;
                  continue;
              }
              
              // Verificar si la cancha existe y tiene nombre
              if (!r.cancha || !r.cancha.nombre) {
                  console.warn(`⚠️ Reserva ${r._id} no tiene cancha o nombre de cancha válido. Cancha: ${JSON.stringify(r.cancha)}`);
                  errores++;
                  continue;
              }
              
              // Formatear la fecha para mostrarla de manera legible
              const fechaBonita = new Date(`${r.fecha}`).toLocaleString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
              });
              
              console.log(`📧 Enviando recordatorio a ${r.cliente.correo}...`);
              
              // Llamar a la función de envío de correo
              await enviarCorreo('recordatorio', {
                  to: r.cliente.correo,
                  nombre: r.cliente.nombre,
                  apellido: r.cliente.apellido || '',
                  cancha: r.cancha.nombre,
                  fecha: fechaBonita,
                  horaInicio: r.horaInicio
              });
              
              console.log(`✅ Recordatorio enviado a ${r.cliente.correo}`);
              enviados++;
              
          } catch (error) {
              console.error(`❌ Error al procesar reserva ${r._id}:`, error.message);
              errores++;
          }
      }
      
      // Resumen del proceso
      console.log('\n📊 Resumen del proceso de recordatorios:');
      console.log(`✅ ${enviados} recordatorios enviados exitosamente`);
      console.log(`⚠️  ${errores} reservas con errores`);
      
  } catch (error) {
      console.error('❌ Error general en el envío de recordatorios:', error);
  } finally {
      console.log('✅ Proceso de recordatorios finalizado\n');
  }
});
