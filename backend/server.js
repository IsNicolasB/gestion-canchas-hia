// server.js - Archivo principal del servidor
require('./cron/enviarRecordatorioNodeMailer');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database'); // ✅ Importar correctamente
//const errorHandler = require('./middleware/errorHandler');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');

// Importar rutas
const CanchaRoutes = require('./routes/CanchaRoutes');
const ClienteRoutes = require('./routes/ClienteRoutes');
const EncargadoRoutes = require('./routes/EncargadoRoutes');
const HorarioRoutes = require('./routes/HorarioRoutes');
const PagoRoutes = require('./routes/PagoRoutes');
const ReservaRoutes = require('./routes/ReservaRoutes');
const UsuarioRoutes = require('./routes/UsuarioRoutes');
const MetricsRoutes = require('./routes/MetricsRoutes');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de Futbol Reservas',
    version: '1.0.0',
    endpoints: {
      canchas: {
        'GET /canchas': 'Obtener todas las canchas',
        'POST /canchas': 'Crear una nueva cancha',
        'GET /canchas/:id': 'Obtener una cancha por ID',
        'PUT /canchas/:id': 'Actualizar una cancha por ID',
        'DELETE /canchas/:id': 'Eliminar una cancha por ID'
      },
      clientes: {
        'GET /clientes': 'Obtener todos los clientes',
        'POST /clientes': 'Crear un nuevo cliente',
        'GET /clientes/:id': 'Obtener un cliente por ID',
        'PUT /clientes/:id': 'Actualizar un cliente por ID',
        'DELETE /clientes/:id': 'Eliminar un cliente por ID'
      },
      encargados: {
        'GET /encargados': 'Obtener todos los encargados',
        'POST /encargados': 'Crear un nuevo encargado',
        'GET /encargados/:id': 'Obtener un encargado por ID',
        'PUT /encargados/:id': 'Actualizar un encargado por ID',
        'DELETE /encargados/:id': 'Eliminar un encargado por ID'
      },
      horarios: {
        'GET /horarios': 'Obtener todos los horarios',
        'POST /horarios': 'Crear un nuevo horario',
        'GET /horarios/:id': 'Obtener un horario por ID',
        'PUT /horarios/:id': 'Actualizar un horario por ID',
        'DELETE /horarios/:id': 'Eliminar un horario por ID'
      },
      pagos: {
        'GET /pagos': 'Obtener todos los pagos',
        'POST /pagos': 'Crear un nuevo pago',
        'GET /pagos/:id': 'Obtener un pago por ID',
        'PUT /pagos/:id': 'Actualizar un pago por ID',
        'DELETE /pagos/:id': 'Eliminar un pago por ID'
      },
      reservas: {
        'GET /reservas': 'Obtener todas las reservas',
        'POST /reservas': 'Crear una nueva reserva',
        'GET /reservas/:id': 'Obtener una reserva por ID',
        'PUT /reservas/:id': 'Actualizar una reserva por ID',
        'DELETE /reservas/:id': 'Eliminar una reserva por ID'
      },
      usuarios: {
        'GET /usuarios': 'Obtener todos los usuarios',
        'POST /usuarios': 'Crear un nuevo usuario',
        'GET /usuarios/:id': 'Obtener un usuario por ID',
        'PUT /usuarios/:id': 'Actualizar un usuario por ID',
        'DELETE /usuarios/:id': 'Eliminar un usuario por ID'
      }
    }
  });
});

// Rutas de la API
app.use('/canchas', CanchaRoutes);
app.use('/clientes', ClienteRoutes);
app.use('/encargados', EncargadoRoutes);
app.use('/horarios', HorarioRoutes);
app.use('/pagos', PagoRoutes);
app.use('/reservas', ReservaRoutes);
app.use('/usuarios', UsuarioRoutes);
app.use('/metrics', MetricsRoutes);
app.use('/api', healthRouter);

// Middleware de manejo de errores (debe ir al final)
//app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
});
