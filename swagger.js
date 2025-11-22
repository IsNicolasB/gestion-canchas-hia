const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API de Futbol Reservas',
    description: 'Documentación de la API para la gestión de reservas de canchas de fútbol.'
  },
  host: 'localhost:3000', // Cambia si usas otro host o puerto
  basePath: "/",
  schemes: ['http'],
  tags: [
    {
      name: 'Canchas',
      description: 'Operaciones relacionadas con las canchas.'
    },
    {
      name: 'Clientes',
      description: 'Operaciones relacionadas con los clientes.'
    },
    {
      name: 'Encargados',
      description: 'Operaciones relacionadas con los encargados.'
    },
    {
      name: 'Horarios',
      description: 'Operaciones relacionadas con los horarios.'
    },
    {
      name: 'Pagos',
      description: 'Operaciones relacionadas con los pagos.'
    },
    {
      name: 'Reservas',
      description: 'Operaciones relacionadas con las reservas.'
    },
    {
      name: 'Usuarios',
      description: 'Operaciones relacionadas con los usuarios.'
    }
  ],
  definitions: {
    Cancha: {
      tipo: 'Fútbol 5',
      ubicacion: 'Av. Siempre Viva 123',
      dimensiones: '40x20',
      imagen: 'http://ejemplo.com/imagen.jpg',
      estado: 'disponible'
    },
    Cliente: {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@mail.com',
      contraseña: '123456',
      telefono: '123456789',
      antecedente: 'Sin antecedentes'
    },
    Encargado: {
      nombre: 'Pedro',
      apellido: 'Gómez',
      correo: 'pedro@mail.com',
      contraseña: 'abcdef',
      legajo: 'E123'
    },
    Horario: {
      fecha: '2025-06-13T00:00:00.000Z',
      horaInicio: '14:00',
      horaFin: '15:00',
      estado: 'disponible'
    },
    Pago: {
      importeTotal: 1000,
      importePendiente: 500,
      estado: 'pendiente'
    },
    Reserva: {
      horarioReservado: '60c72b2f9b1e8e001c8e4b8a',
      cancha: '60c72b2f9b1e8e001c8e4b8b',
      cliente: '60c72b2f9b1e8e001c8e4b8c',
      pago: '60c72b2f9b1e8e001c8e4b8d'
    },
    Usuario: {
      nombre: 'Usuario',
      apellido: 'Apellido',
      correo: 'usuario@mail.com',
      contraseña: 'clave123'
    }
  }
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./server.js']; // Cambia si tu archivo principal tiene otro nombre

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log(`Documentación generada en ${outputFile}`);
  //require('./server.js'); // Descomenta si quieres iniciar el server
});