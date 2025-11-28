// drop_indexes.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/mi_app_db";

//////////////////////////////////////////////////////
// Índices a eliminar (excepto _id que es obligatorio)
//////////////////////////////////////////////////////
const indexesToDrop = [
  // Reservas
  { collection: "reservas", indexName: "idx_reserva_cancha_fecha" },
  { collection: "reservas", indexName: "idx_reserva_cliente_fecha" },
  { collection: "reservas", indexName: "idx_reserva_fecha" },
  { collection: "reservas", indexName: "fecha_1_cancha_1" },
  { collection: "reservas", indexName: "idx_reservas_cliente_fecha" },
  
  // Horarios
  { collection: "horarios", indexName: "idx_horario_cancha_fecha_hora" },
  { collection: "horarios", indexName: "fecha_1_cancha_1_horaInicio_1" },
  
  // Pagos
  { collection: "pagos", indexName: "idx_pagos_estado" },
  { collection: "pagos", indexName: "estado_1" },
  { collection: "pagos", indexName: "idx_pagos_estado_cliente_fecha" },
  { collection: "pagos", indexName: "idx_pagos_pagado_fecha_partial" },
  { collection: "pagos", indexName: "idx_pagos_cliente_fecha" },
  { collection: "pagos", indexName: "idx_pagos_cliente" },
  { collection: "pagos", indexName: "idx_pagos_estado_fecha" },
  
  // Usuarios/Clientes
  { collection: "usuarios", indexName: "idx_clientes_apellido" },
  { collection: "usuarios", indexName: "idx_usuarios_correo" },
  { collection: "usuarios", indexName: "idx_usuarios_tipo_apellido" },
  
  // Canchas
  { collection: "canchas", indexName: "idx_canchas_tipo" },
  { collection: "canchas", indexName: "idx_canchas_estado" },
  { collection: "canchas", indexName: "idx_canchas_estado_tipo" },
];

//////////////////////////////////////////////////////
// Función para eliminar un índice si existe
//////////////////////////////////////////////////////
async function dropIndexIfExists(db, { collection, indexName }) {
  try {
    const col = db.collection(collection);
    
    // Verificar si el índice existe
    const existing = await col.listIndexes().toArray();
    const found = existing.find(i => i.name === indexName);
    
    if (!found) {
      console.log(`⚪ ${collection}.${indexName} -> no existe, saltando`);
      return;
    }
    
    // Eliminar el índice
    await col.dropIndex(indexName);
    console.log(`❌ ${collection}.${indexName} -> eliminado`);
  } catch (error) {
    if (error.message.includes('index not found')) {
      console.log(`⚪ ${collection}.${indexName} -> ya no existe`);
    } else {
      console.error(`⚠ Error eliminando ${collection}.${indexName}:`, error.message);
    }
  }
}

//////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////
async function main() {
  console.log("🔴 ADVERTENCIA: Este script eliminará índices de tu base de datos");
  console.log("   Esto permitirá comparar el rendimiento sin índices.\n");
  console.log("   Después puedes recrearlos con: node create_indexes.js\n");
  
  console.log("Conectando a MongoDB...");
  const conn = await mongoose.connect(MONGO);
  console.log("🟢 Conectado");

  const db = conn.connection.db;

  console.log("\n🗑️  Eliminando índices...\n");

  for (const idx of indexesToDrop) {
    await dropIndexIfExists(db, idx);
  }

  console.log("\n✅ Índices eliminados.");
  console.log("\n📋 Pasos siguientes:");
  console.log("   1. Ejecuta: node analyze_queries.js > queries_sin_indices.md");
  console.log("   2. Ejecuta: node create_indexes.js");
  console.log("   3. Ejecuta: node analyze_queries.js > queries_con_indices.md");
  console.log("   4. Compara ambos archivos\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
