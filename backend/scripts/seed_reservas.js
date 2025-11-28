// seed_reservas.js - ULTRA OPTIMIZADO
require('dotenv').config();

const mongoose = require('mongoose');

const Cancha = require('./models/Cancha');
const Cliente = require('./models/Cliente');
const Horario = require('./models/Horario');
const Pago = require('./models/Pago');
const Reserva = require('./models/Reserva');

// --- CONFIGURACIÓN ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://devuser:devpass@mongo-primary:27017/mi_app_db?authSource=admin&w=1';
const NUM_CANCHAS = 10;
const NUM_RESERVAS = 500000;
const BATCH_SIZE = 5000; // Lotes más grandes

// Configuración de canchas
const TIPOS_CANCHA = ['Futbol 5', 'Futbol 7', 'Futbol 11', 'Futbol Sala'];
const UBICACIONES = ['Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste', 'Centro'];
const DIMENSIONES = {
  'Futbol 5': '20m x 40m',
  'Futbol 7': '30m x 50m', 
  'Futbol 11': '68m x 105m',
  'Futbol Sala': '20m x 40m'
};
const PRECIO_BASE = {
  'Futbol 5': 3000,
  'Futbol 7': 5000,
  'Futbol 11': 8000,
  'Futbol Sala': 3500
};

// Rango de fechas 2022-2027 (en milisegundos para cálculos rápidos)
const FECHA_INICIO_MS = new Date('2022-01-01').getTime();
const FECHA_FIN_MS = new Date('2027-12-31').getTime();
const RANGO_FECHAS_MS = FECHA_FIN_MS - FECHA_INICIO_MS;

// Horarios
const HORA_INICIO = 10;
const HORA_FIN = 22;

// Pre-generar arrays de horas válidas
const HORAS_VALIDAS_1H = [];
const HORAS_VALIDAS_2H = [];
for (let h = HORA_INICIO; h < HORA_FIN; h++) {
  HORAS_VALIDAS_1H.push(h);
  if (h < HORA_FIN - 1) HORAS_VALIDAS_2H.push(h);
}

// Función ultra-rápida para generar fecha
function generarFechaRapida() {
  const ms = FECHA_INICIO_MS + Math.random() * RANGO_FECHAS_MS;
  const fecha = new Date(ms);
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// Pre-calcular strings de horas
const HORAS_STR = {};
for (let h = HORA_INICIO; h <= HORA_FIN; h++) {
  HORAS_STR[h] = h.toString().padStart(2, '0') + ':00';
}

async function crearCanchas() {
  console.log('\n🏟️  Creando 10 canchas...');
  
  const canchas = [];
  for (let i = 1; i <= NUM_CANCHAS; i++) {
    const tipo = TIPOS_CANCHA[i % 4];
    const precioBase = PRECIO_BASE[tipo];
    const variacion = Math.floor(Math.random() * 1500) - 500;
    
    canchas.push({
      nombre: `Cancha ${i}`,
      tipo: tipo,
      ubicacion: UBICACIONES[i % 5],
      dimensiones: DIMENSIONES[tipo],
      imagen: `https://picsum.photos/400/300?random=${i}`,
      estado: 'disponible',
      precioPorHora: precioBase + variacion
    });
  }
  
  const canchasCreadas = await Cancha.insertMany(canchas);
  console.log(`✅ ${canchasCreadas.length} canchas creadas`);
  return canchasCreadas;
}

async function crearReservas(canchas, clienteIds) {
  console.log(`\n📅 Creando ${NUM_RESERVAS.toLocaleString()} reservas en lotes de ${BATCH_SIZE}...`);
  
  let insertedCount = 0;
  const canchaData = canchas.map(c => ({ id: c._id, precio: c.precioPorHora }));
  const numClientes = clienteIds.length;
  const numCanchas = canchaData.length;
  
  // Generar todos los external_reference de una vez
  const externalRefs = [];
  for (let i = 0; i < NUM_RESERVAS; i++) {
    externalRefs.push(new mongoose.Types.ObjectId().toString());
  }
  
  for (let i = 0; i < NUM_RESERVAS; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, NUM_RESERVAS - i);
    const reservasBatch = [];
    const horariosBatch = [];
    const pagosBatch = [];
    
    for (let j = 0; j < batchSize; j++) {
      const idx = i + j;
      
      // Selección ultra-rápida sin helpers
      const canchaIdx = Math.floor(Math.random() * numCanchas);
      const cancha = canchaData[canchaIdx];
      const clienteId = clienteIds[Math.floor(Math.random() * numClientes)];
      const fecha = generarFechaRapida();
      const duracion = Math.random() < 0.8 ? 1 : 2;
      
      // Seleccionar hora válida directamente
      const horasValidas = duracion === 1 ? HORAS_VALIDAS_1H : HORAS_VALIDAS_2H;
      const horaInicioNum = horasValidas[Math.floor(Math.random() * horasValidas.length)];
      const horaInicio = HORAS_STR[horaInicioNum];
      const horaFin = HORAS_STR[horaInicioNum + duracion];
      
      // Cálculos directos
      const importeTotal = cancha.precio * duracion;
      const estadoPago = Math.random() < 0.8 ? 'pagado' : 'pendiente';
      const importePendiente = estadoPago === 'pagado' ? 0 : importeTotal;
      
      // IDs pre-generados
      const pagoId = new mongoose.Types.ObjectId();
      const horariosIds = [];
      
      // Crear horarios consecutivos
      for (let h = 0; h < duracion; h++) {
        const horarioId = new mongoose.Types.ObjectId();
        const bloqueNum = horaInicioNum + h;
        
        horariosBatch.push({
          _id: horarioId,
          cancha: cancha.id,
          fecha: fecha,
          horaInicio: HORAS_STR[bloqueNum],
          horaFin: HORAS_STR[bloqueNum + 1],
          estado: 'ocupado'
        });
        
        horariosIds.push(horarioId);
      }
      
      // Crear pago
      pagosBatch.push({
        _id: pagoId,
        importeTotal: importeTotal,
        importePendiente: importePendiente,
        estado: estadoPago,
        mp_preference_id: estadoPago === 'pagado' ? externalRefs[idx].substring(0, 32) : null,
        external_reference: externalRefs[idx],
        cancha: cancha.id,
        cliente: clienteId,
        fecha: fecha,
        horaInicio: horaInicio,
        horaFin: horaFin
      });
      
      // Crear reserva
      reservasBatch.push({
        horariosReservados: horariosIds,
        cancha: cancha.id,
        cliente: clienteId,
        fecha: fecha,
        horaInicio: horaInicio,
        horaFin: horaFin,
        pago: pagoId
      });
    }
    
    // Inserción paralela con Promise.all
    await Promise.all([
      Pago.insertMany(pagosBatch, { ordered: false, lean: true }),
      Horario.insertMany(horariosBatch, { ordered: false, lean: true }),
      Reserva.insertMany(reservasBatch, { ordered: false, lean: true })
    ]);
    
    insertedCount += batchSize;
    
    // Progreso
    process.stdout.write(`\r[${new Date().toLocaleTimeString('es-ES')}] Insertados: ${insertedCount.toLocaleString()} / ${NUM_RESERVAS.toLocaleString()} (${((insertedCount / NUM_RESERVAS) * 100).toFixed(2)}%)`);
    
    // Pausa cada 100,000 (no cada 50k)
    if (insertedCount % 100000 === 0 && insertedCount < NUM_RESERVAS) {
      process.stdout.write(' - Pausa 1s...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n✅ Reservas, horarios y pagos creados');
  return insertedCount;
}

async function seed() {
  const start = Date.now();
  
  try {
    // Conexión optimizada
    await mongoose.connect(MONGODB_URI, {
      socketTimeoutMS: 600000,
      serverSelectionTimeoutMS: 60000,
      maxPoolSize: 100,
      minPoolSize: 50,
      maxIdleTimeMS: 60000
    });
    
    console.log('🟢 Conectado a MongoDB');
    
    // Desactivar índices temporalmente para velocidad
    await mongoose.connection.db.collection('reservas').dropIndexes().catch(() => {});
    await mongoose.connection.db.collection('horarios').dropIndexes().catch(() => {});
    await mongoose.connection.db.collection('pagos').dropIndexes().catch(() => {});
    
    // Limpiar
    console.log('\n🧹 Limpiando colecciones...');
    await Promise.all([
      Cancha.deleteMany({}),
      Horario.deleteMany({}),
      Pago.deleteMany({}),
      Reserva.deleteMany({})
    ]);
    console.log('✅ Limpieza completa');
    
    // Obtener solo IDs de clientes (más rápido)
    console.log('\n👥 Obteniendo clientes...');
    const clientes = await Cliente.find({}, { _id: 1 }).lean();
    const clienteIds = clientes.map(c => c._id);
    console.log(`✅ ${clienteIds.length.toLocaleString()} clientes`);
    
    if (clienteIds.length === 0) {
      throw new Error('No hay clientes. Ejecuta seed_clientes.js primero.');
    }
    
    // Crear canchas
    const canchas = await crearCanchas();
    
    // Crear reservas
    await crearReservas(canchas, clienteIds);
    
    // Recrear índices importantes
    console.log('\n🔨 Recreando índices...');
    await Promise.all([
      Reserva.collection.createIndex({ fecha: 1, cancha: 1 }),
      Horario.collection.createIndex({ fecha: 1, cancha: 1, horaInicio: 1 }),
      Pago.collection.createIndex({ estado: 1 })
    ]);
    
    // Estadísticas
    const duration = (Date.now() - start) / 1000;
    const [totalReservas, totalHorarios, totalPagos] = await Promise.all([
      Reserva.countDocuments(),
      Horario.countDocuments(),
      Pago.countDocuments()
    ]);
    
    console.log('\n\n📊 RESUMEN:');
    console.log(`  🏟️  Canchas: ${canchas.length}`);
    console.log(`  📅 Reservas: ${totalReservas.toLocaleString()}`);
    console.log(`  ⏰ Horarios: ${totalHorarios.toLocaleString()}`);
    console.log(`  💰 Pagos: ${totalPagos.toLocaleString()}`);
    console.log(`  ⏱️  Tiempo: ${duration.toFixed(2)}s (${(duration / 60).toFixed(2)} min)`);
    console.log(`  🚀 Velocidad: ${Math.floor(NUM_RESERVAS / duration).toLocaleString()} reservas/seg`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🚪 Conexión cerrada');
    process.exit(0);
  }
}

seed();