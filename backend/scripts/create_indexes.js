// create_indexes.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/mi_app_db";

//////////////////////////////////////////////////////
// Índices óptimos sugeridos según tu caso de uso
//////////////////////////////////////////////////////
const indexList = [
  {
    collection: "reservas",
    index: { cancha: 1, fecha: 1 },
    name: "idx_reserva_cancha_fecha"
  },
  {
    collection: "reservas",
    index: { cliente: 1, fecha: 1 },
    name: "idx_reserva_cliente_fecha"
  },
  {
    collection: "reservas",
    index: { fecha: 1 },
    name: "idx_reserva_fecha"
  },
  {
    collection: "horarios",
    index: { cancha: 1, fecha: 1, horaInicio: 1 },
    name: "idx_horarios_cancha_fecha_hora"
  },
  {
    collection: "pagos",
    index: { estado: 1 },
    name: "idx_pagos_estado"
  },
  // Índice compuesto para pagos por cliente con ordenamiento por fecha
  {
    collection: "pagos",
    index: { cliente: 1, fecha: -1 },
    name: "idx_pagos_cliente_fecha"
  },
  // Índice compuesto para estado + cliente + fecha (queries combinadas)
  {
    collection: "pagos",
    index: { estado: 1, cliente: 1, fecha: -1 },
    name: "idx_pagos_estado_cliente_fecha"
  },
  // Índice para estadísticas de ingresos por cancha
  {
    collection: "pagos",
    index: { cancha: 1, estado: 1, fecha: -1 },
    name: "idx_pagos_cancha_estado_fecha"
  },
  // Índice compuesto estado + fecha para reportes
  {
    collection: "pagos",
    index: { estado: 1, fecha: -1 },
    name: "idx_pagos_estado_fecha"
  },
  // Índice parcial: sólo indexa documentos con estado = 'pagado' y optimiza búsquedas por fecha
  {
    collection: "pagos",
    index: { fecha: -1 },
    name: "idx_pagos_pagado_fecha_partial",
    partial: { filter: { estado: "pagado" } }
  },
  // Usuarios/Clientes - La colección es 'usuarios' con tipo: 'Cliente'
  {
    collection: "usuarios",
    index: { tipo: 1, apellido: 1 },
    name: "idx_usuarios_tipo_apellido"
  },
  {
    collection: "usuarios",
    index: { tipo: 1, nombre: 1 },
    name: "idx_usuarios_tipo_nombre"
  },
  {
    collection: "usuarios",
    index: { correo: 1 },
    name: "correo_1",
    unique: true
  },
  {
    collection: "usuarios",
    index: { tipo: 1, correo: 1 },
    name: "idx_usuarios_tipo_correo"
  },
  // Canchas - Índices para búsquedas por tipo de deporte
  {
    collection: "canchas",
    index: { tipo: 1 },
    name: "idx_canchas_tipo"
  },
  {
    collection: "canchas",
    index: { estado: 1 },
    name: "idx_canchas_estado"
  },
  // Índice compuesto para filtros combinados de estado y tipo
  {
    collection: "canchas",
    index: { estado: 1, tipo: 1 },
    name: "idx_canchas_estado_tipo"
  }
];

//////////////////////////////////////////////////////
// Función para crear sin duplicar
//////////////////////////////////////////////////////
async function ensureIndex(db, { collection, index, name, unique, partial }) {
  // Verificar si la colección existe y cuántos documentos tiene
  const collections = await db.listCollections({ name: collection }).toArray();
  if (collections.length === 0) {
    console.log(`⚠ ${collection} -> colección NO existe en la base de datos. Se creará al crear índices si es necesario.`);
  }

  const col = db.collection(collection);
  try {
    const count = await col.countDocuments();
    console.log(`ℹ ${collection} -> documentos en la colección: ${count}`);
  } catch (err) {
    console.log(`ℹ ${collection} -> no se pudo obtener el conteo: ${err.message}`);
  }

  const existing = await col.listIndexes().toArray();

  if (existing.find(i => i.name === name)) {
    console.log(`✔ ${collection} -> índice ya existe (${name})`);
    return;
  }

  // Construir opciones del índice
  const createOptions = { name };
  
  // Soportar índices únicos
  if (unique === true) {
    createOptions.unique = true;
  }
  
  // Soportar índices parciales
  if (partial && partial.filter) {
    createOptions.partialFilterExpression = partial.filter;
  }

  await col.createIndex(index, createOptions);
  console.log(`➕ ${collection} -> índice creado: ${name}`);
}

//////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////
async function main() {
  console.log("Conectando a MongoDB...");
  const conn = await mongoose.connect(MONGO);
  console.log("🟢 Conectado");

  const db = conn.connection.db;

  console.log("\n🔨 Creando índices...\n");

  for (const idx of indexList) {
    await ensureIndex(db, idx);
  }

  console.log("\n🏁 Índices creados correctamente.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
