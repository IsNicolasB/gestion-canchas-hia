// analyze_queries.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/mi_app_db";

////////////////////////////////////////////////////////
// Helper para imprimir bonito
////////////////////////////////////////////////////////
function print(title, text) {
  console.log("\n" + "=".repeat(90));
  console.log(">> " + title);
  console.log("=".repeat(90));
  console.log(text);
}

////////////////////////////////////////////////////////
// Ejecutar explain sobre una coleccion y query
////////////////////////////////////////////////////////
async function analyzeQuery(db, colName, query, sortOptions = null, description = "", hintIndex = null) {
  const col = db.collection(colName);

  let cursor = col.find(query);
  if (sortOptions) {
    cursor = cursor.sort(sortOptions);
  }
  // Aplicar hint si se especifica (forzar indice)
  if (hintIndex) {
    cursor = cursor.hint(hintIndex);
  }

  const explain = await cursor.explain("executionStats");

  const stats = explain.executionStats;
  const winning = explain.queryPlanner.winningPlan;

  const usedIndex = winning.inputStage?.indexName ||
                    winning.inputStage?.inputStage?.indexName ||
                    winning.stage?.inputStage?.indexName ||
                      "Ninguno (COLLSCAN)";

  const sortUsed = sortOptions ? `\nOrdenamiento: ${JSON.stringify(sortOptions)}` : '';
    const descText = description ? `\nDescripcion: ${description}` : '';

  print(
    `Coleccion: ${colName}`,
    `${descText}
Query: ${JSON.stringify(query, null, 2)}${sortUsed}
  Indice usado: ${usedIndex}
Documentos examinados: ${stats.totalDocsExamined}
Documentos retornados: ${stats.nReturned}
  Tiempo ejecucion: ${stats.executionTimeMillis}ms
Plan:
${JSON.stringify(winning, null, 2)}
`
  );

  // Si no usó índice… sugerir
    if (usedIndex.includes("Ninguno")) {
     console.log("! SUGERENCIA: Esta consulta NO usa indice. Considera crear uno adecuado.");
  }

    // Alerta si examina muchos mas docs de los que retorna
  if (stats.totalDocsExamined > stats.nReturned * 10 && stats.nReturned > 0) {
     console.log(`! ALERTA: Se examinaron ${stats.totalDocsExamined} documentos pero solo se retornaron ${stats.nReturned}. Considera optimizar el indice.`);
  }
}

////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////
async function main() {
  console.log("Conectando a MongoDB...");
  const conn = await mongoose.connect(MONGO);
  console.log("OK - Conectado");

  const db = conn.connection.db;

  // Obtener IDs de ejemplo de la base de datos
  let idCanchaEjemplo, idClienteEjemplo, fechaEjemplo;

  try {
    const cancha = await db.collection("canchas").findOne();
    idCanchaEjemplo = cancha ? cancha._id.toString() : null;
    
    // Buscar un cliente (usuarios con tipo="Cliente")
    const cliente = await db.collection("usuarios").findOne({ tipo: "Cliente" });
    idClienteEjemplo = cliente ? cliente._id.toString() : null;

    const reserva = await db.collection("reservas").findOne();
    fechaEjemplo = reserva ? reserva.fecha : "2024-11-22";

    if (!idCanchaEjemplo || !idClienteEjemplo) {
        console.log("! ADVERTENCIA: No se encontraron datos suficientes en la base de datos.");
        console.log(`   Cancha: ${idCanchaEjemplo ? "OK" : "NO"}  Cliente: ${idClienteEjemplo ? "OK" : "NO"}`);
      if (!idClienteEjemplo) {
        console.log("   No hay usuarios con tipo='Cliente' en la coleccion 'usuarios'");
      }
      process.exit(1);
    }
  } catch (err) {
      console.error("ERROR obteniendo datos de ejemplo:", err.message);
    process.exit(1);
  }

  console.log("\n>> Analizando queries comunes del sistema...\n");
    console.log(`>> Usando: Cancha=${idCanchaEjemplo.substring(0, 8)}..., Cliente=${idClienteEjemplo.substring(0, 8)}..., Fecha=${fechaEjemplo}`);

  // ========== QUERIES DE RESERVAS ==========
  
  // 1. Obtener reservas por cliente (usado en "Mis Reservas" del frontend)
  await analyzeQuery(
    db,
    "reservas",
    { cliente: new mongoose.Types.ObjectId(idClienteEjemplo) },
    { fecha: -1 },
    "Query: Obtener reservas de un cliente (Mis Reservas) - obtenerReservasPorCliente"
  );

  // 2. Buscar reservas por cancha y fecha (usado en disponibilidad de horarios)
  await analyzeQuery(
    db,
    "reservas",
    { 
      cancha: new mongoose.Types.ObjectId(idCanchaEjemplo),
      fecha: fechaEjemplo
    },
    null,
    "Query: Buscar reservas por cancha y fecha - verificar disponibilidad"
  );

    // 3. Buscar reservas por cliente en una fecha especifica
  await analyzeQuery(
    db,
    "reservas",
    { 
      cliente: new mongoose.Types.ObjectId(idClienteEjemplo),
      fecha: fechaEjemplo
    },
    { horaInicio: 1 },
      "Query: Reservas de un cliente en fecha especifica - obtenerReservasPorClienteYFecha"
  );

    // 4. Reservas con rango de fechas (para estadisticas)
  const hoy = new Date();
  const hace30dias = new Date(hoy);
  hace30dias.setDate(hace30dias.getDate() - 30);
  
  await analyzeQuery(
    db,
    "reservas",
    { 
      fecha: { 
        $gte: hace30dias.toISOString().split('T')[0],
        $lte: hoy.toISOString().split('T')[0]
      }
    },
    { fecha: -1 },
      "Query: Reservas en rango de fechas (ultimos 30 dias) - para estadisticas"
  );

  // ========== QUERIES DE HORARIOS ==========

  // 5. Horarios por cancha y fecha (usado para mostrar disponibilidad)
  await analyzeQuery(
    db,
    "horarios",
    { 
      cancha: new mongoose.Types.ObjectId(idCanchaEjemplo),
      fecha: fechaEjemplo
    },
    null,
    "Query: Horarios por cancha y fecha - obtenerHorariosPorCanchaYFecha"
  );

  // 6. Horarios ocupados en un rango de horas
  await analyzeQuery(
    db,
    "horarios",
    { 
      cancha: new mongoose.Types.ObjectId(idCanchaEjemplo),
      fecha: fechaEjemplo,
      estado: "ocupado"
    },
    { horaInicio: 1 },
    "Query: Horarios ocupados por cancha, fecha y estado"
  );

  // ========== QUERIES DE PAGOS ==========

  // 7. Pagos por cliente (usado en "Mis Pagos")
  await analyzeQuery(
    db,
    "pagos",
    { cliente: new mongoose.Types.ObjectId(idClienteEjemplo) },
    { fecha: -1 },
    "Query: Pagos de un cliente ordenados por fecha - obtenerPagosPorCliente"
  );

  // 8. Pagos por estado (para administración)
  await analyzeQuery(
    db,
    "pagos",
    { estado: "pagado" },
    null,
    "Query: Todos los pagos con estado 'pagado' - reporte de pagos"
  );

  // 9. Pagos pendientes de un cliente
  await analyzeQuery(
    db,
    "pagos",
    { 
      cliente: new mongoose.Types.ObjectId(idClienteEjemplo),
      estado: "pendiente"
    },
    { fecha: -1 },
    "Query: Pagos pendientes de un cliente específico"
  );

  // 10. Pagos por cancha en rango de fechas (para estadísticas de ingresos)
  await analyzeQuery(
    db,
    "pagos",
    { 
      cancha: new mongoose.Types.ObjectId(idCanchaEjemplo),
      fecha: { 
        $gte: hace30dias.toISOString().split('T')[0],
        $lte: hoy.toISOString().split('T')[0]
      },
      estado: "pagado"
    },
    { fecha: -1 },
    "Query: Pagos de una cancha en rango de fechas - estadísticas de ingresos"
  );

  // ========== QUERIES DE USUARIOS/CLIENTES ==========

  // 11. Buscar clientes por apellido (usado en busqueda del encargado)
  // OPTIMIZADO: Regex anclado + hint para forzar indice correcto
  await analyzeQuery(
    db,
    "usuarios",
    { tipo: "Cliente", apellido: { $regex: "^García", $options: "i" } },
    null,
    "Query: Buscar clientes por apellido (regex ANCLADO + HINT) - buscarClientePorNombreApellido",
    "idx_usuarios_tipo_apellido"  // Hint: forzar este indice
  );

  // 12. Buscar clientes por nombre
  // OPTIMIZADO: Regex anclado + hint para forzar indice correcto
  await analyzeQuery(
    db,
    "usuarios",
    { tipo: "Cliente", nombre: { $regex: "^Juan", $options: "i" } },
    null,
    "Query: Buscar clientes por nombre (regex ANCLADO + HINT)",
    "idx_usuarios_tipo_nombre"  // Hint: usar indice compuesto tipo+nombre
  );

  // 13. Buscar clientes por correo (login)
  await analyzeQuery(
    db,
    "usuarios",
    { tipo: "Cliente", correo: "cliente@example.com" },
    null,
    "Query: Buscar cliente por correo (autenticación/login)"
  );

  // 14. Buscar clientes por nombre Y apellido
  // OPTIMIZADO: Regex anclado + hint para usar indices compuestos
  await analyzeQuery(
    db,
    "usuarios",
    { 
      tipo: "Cliente",
      nombre: { $regex: "^Juan", $options: "i" },
      apellido: { $regex: "^García", $options: "i" }
    },
    null,
    "Query: Buscar clientes por nombre Y apellido (busqueda combinada - REGEX ANCLADO + HINT)",
    "idx_usuarios_tipo_apellido"  // Hint: priorizar indice compuesto
  );

  // 15. Buscar clientes por correo sin tipo (login general)
  await analyzeQuery(
    db,
    "usuarios",
    { correo: "cliente@example.com" },
    null,
    "Query: Login por correo (sin filtro de tipo)"
  );

  // ========== QUERIES DE CANCHAS ==========

  // 16. Buscar canchas por tipo de deporte
  await analyzeQuery(
    db,
    "canchas",
    { tipo: "Fútbol" },
    null,
    "Query: Buscar canchas por tipo de deporte"
  );

  // 17. Buscar canchas disponibles (estado activo)
  await analyzeQuery(
    db,
    "canchas",
    { estado: "activo" },
    null,
    "Query: Listar canchas activas/disponibles"
  );

  // 18. Buscar canchas por estado y tipo
  await analyzeQuery(
    db,
    "canchas",
    { estado: "activo", tipo: "Fútbol" },
    null,
    "Query: Buscar canchas activas de un tipo específico"
  );

  await mongoose.disconnect();
    console.log("\n>> Analisis completo.\n");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
