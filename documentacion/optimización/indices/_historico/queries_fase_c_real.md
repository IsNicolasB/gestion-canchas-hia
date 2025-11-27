Conectando a MongoDB...
OK - Conectado

>> Analizando queries comunes del sistema...

>> Usando: Cancha=6924cd56..., Cliente=6924cc9c..., Fecha=2024-09-30

==========================================================================================
>> Colecci├│n: reservas
==========================================================================================

Descripcion: Query: Obtener reservas de un cliente (Mis Reservas) - obtenerReservasPorCliente
Query: {
  "cliente": "6924cc9cfac5a6d0c515b75b"
}
Ordenamiento: {"fecha":-1}
├ìndice usado: idx_reserva_cliente_fecha
Documentos examinados: 1
Documentos retornados: 1
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "cliente": 1,
      "fecha": 1
    },
    "indexName": "idx_reserva_cliente_fecha",
    "isMultiKey": false,
    "multiKeyPaths": {
      "cliente": [],
      "fecha": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "backward",
    "indexBounds": {
      "cliente": [
        "[ObjectId('6924cc9cfac5a6d0c515b75b'), ObjectId('6924cc9cfac5a6d0c515b75b')]"
      ],
      "fecha": [
        "[MaxKey, MinKey]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: reservas
==========================================================================================

Descripcion: Query: Buscar reservas por cancha y fecha - verificar disponibilidad
Query: {
  "cancha": "6924cd563d358233f6b26942",
  "fecha": "2024-09-30"
}
├ìndice usado: idx_reserva_cancha_fecha
Documentos examinados: 17
Documentos retornados: 17
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "cancha": 1,
      "fecha": 1
    },
    "indexName": "idx_reserva_cancha_fecha",
    "isMultiKey": false,
    "multiKeyPaths": {
      "cancha": [],
      "fecha": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "cancha": [
        "[ObjectId('6924cd563d358233f6b26942'), ObjectId('6924cd563d358233f6b26942')]"
      ],
      "fecha": [
        "[\"2024-09-30\", \"2024-09-30\"]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: reservas
==========================================================================================

Descripcion: Query: Reservas de un cliente en fecha espec├¡fica - obtenerReservasPorClienteYFecha
Query: {
  "cliente": "6924cc9cfac5a6d0c515b75b",
  "fecha": "2024-09-30"
}
Ordenamiento: {"horaInicio":1}
├ìndice usado: idx_reserva_cliente_fecha
Documentos examinados: 0
Documentos retornados: 0
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "SORT",
  "sortPattern": {
    "horaInicio": 1
  },
  "memLimit": 104857600,
  "type": "simple",
  "inputStage": {
    "stage": "FETCH",
    "inputStage": {
      "stage": "IXSCAN",
      "keyPattern": {
        "cliente": 1,
        "fecha": 1
      },
      "indexName": "idx_reserva_cliente_fecha",
      "isMultiKey": false,
      "multiKeyPaths": {
        "cliente": [],
        "fecha": []
      },
      "isUnique": false,
      "isSparse": false,
      "isPartial": false,
      "indexVersion": 2,
      "direction": "forward",
      "indexBounds": {
        "cliente": [
          "[ObjectId('6924cc9cfac5a6d0c515b75b'), ObjectId('6924cc9cfac5a6d0c515b75b')]"
        ],
        "fecha": [
          "[\"2024-09-30\", \"2024-09-30\"]"
        ]
      }
    }
  }
}


==========================================================================================
>> Colecci├│n: reservas
==========================================================================================

Descripcion: Query: Reservas en rango de fechas (├║ltimos 30 d├¡as) - para estad├¡sticas
Query: {
  "fecha": {
    "$gte": "2025-10-26",
    "$lte": "2025-11-25"
  }
}
Ordenamiento: {"fecha":-1}
├ìndice usado: idx_reserva_fecha
Documentos examinados: 6920
Documentos retornados: 6920
Tiempo ejecuci├│n: 13ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "fecha": 1
    },
    "indexName": "idx_reserva_fecha",
    "isMultiKey": false,
    "multiKeyPaths": {
      "fecha": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "backward",
    "indexBounds": {
      "fecha": [
        "[\"2025-11-25\", \"2025-10-26\"]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: horarios
==========================================================================================

Descripcion: Query: Horarios por cancha y fecha - obtenerHorariosPorCanchaYFecha
Query: {
  "cancha": "6924cd563d358233f6b26942",
  "fecha": "2024-09-30"
}
├ìndice usado: idx_horarios_cancha_fecha_hora
Documentos examinados: 20
Documentos retornados: 20
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "cancha": 1,
      "fecha": 1,
      "horaInicio": 1
    },
    "indexName": "idx_horarios_cancha_fecha_hora",
    "isMultiKey": false,
    "multiKeyPaths": {
      "cancha": [],
      "fecha": [],
      "horaInicio": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "cancha": [
        "[ObjectId('6924cd563d358233f6b26942'), ObjectId('6924cd563d358233f6b26942')]"
      ],
      "fecha": [
        "[\"2024-09-30\", \"2024-09-30\"]"
      ],
      "horaInicio": [
        "[MinKey, MaxKey]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: horarios
==========================================================================================

Descripcion: Query: Horarios ocupados por cancha, fecha y estado
Query: {
  "cancha": "6924cd563d358233f6b26942",
  "fecha": "2024-09-30",
  "estado": "ocupado"
}
Ordenamiento: {"horaInicio":1}
├ìndice usado: idx_horarios_cancha_fecha_hora
Documentos examinados: 20
Documentos retornados: 20
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "filter": {
    "estado": {
      "$eq": "ocupado"
    }
  },
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "cancha": 1,
      "fecha": 1,
      "horaInicio": 1
    },
    "indexName": "idx_horarios_cancha_fecha_hora",
    "isMultiKey": false,
    "multiKeyPaths": {
      "cancha": [],
      "fecha": [],
      "horaInicio": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "cancha": [
        "[ObjectId('6924cd563d358233f6b26942'), ObjectId('6924cd563d358233f6b26942')]"
      ],
      "fecha": [
        "[\"2024-09-30\", \"2024-09-30\"]"
      ],
      "horaInicio": [
        "[MinKey, MaxKey]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: pagos
==========================================================================================

Descripcion: Query: Pagos de un cliente ordenados por fecha - obtenerPagosPorCliente
Query: {
  "cliente": "6924cc9cfac5a6d0c515b75b"
}
Ordenamiento: {"fecha":-1}
├ìndice usado: idx_pagos_cliente_fecha
Documentos examinados: 1
Documentos retornados: 1
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "cliente": 1,
      "fecha": -1
    },
    "indexName": "idx_pagos_cliente_fecha",
    "isMultiKey": false,
    "multiKeyPaths": {
      "cliente": [],
      "fecha": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "cliente": [
        "[ObjectId('6924cc9cfac5a6d0c515b75b'), ObjectId('6924cc9cfac5a6d0c515b75b')]"
      ],
      "fecha": [
        "[MaxKey, MinKey]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: pagos
==========================================================================================

Descripcion: Query: Todos los pagos con estado 'pagado' - reporte de pagos
Query: {
  "estado": "pagado"
}
├ìndice usado: idx_pagos_estado
Documentos examinados: 399910
Documentos retornados: 399910
Tiempo ejecuci├│n: 317ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "estado": 1
    },
    "indexName": "idx_pagos_estado",
    "isMultiKey": false,
    "multiKeyPaths": {
      "estado": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "estado": [
        "[\"pagado\", \"pagado\"]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: pagos
==========================================================================================

Descripcion: Query: Pagos pendientes de un cliente espec├¡fico
Query: {
  "cliente": "6924cc9cfac5a6d0c515b75b",
  "estado": "pendiente"
}
Ordenamiento: {"fecha":-1}
├ìndice usado: idx_pagos_estado_cliente_fecha
Documentos examinados: 1
Documentos retornados: 1
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "estado": 1,
      "cliente": 1,
      "fecha": -1
    },
    "indexName": "idx_pagos_estado_cliente_fecha",
    "isMultiKey": false,
    "multiKeyPaths": {
      "estado": [],
      "cliente": [],
      "fecha": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "estado": [
        "[\"pendiente\", \"pendiente\"]"
      ],
      "cliente": [
        "[ObjectId('6924cc9cfac5a6d0c515b75b'), ObjectId('6924cc9cfac5a6d0c515b75b')]"
      ],
      "fecha": [
        "[MaxKey, MinKey]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: pagos
==========================================================================================

Descripcion: Query: Pagos de una cancha en rango de fechas - estad├¡sticas de ingresos
Query: {
  "cancha": "6924cd563d358233f6b26942",
  "fecha": {
    "$gte": "2025-10-26",
    "$lte": "2025-11-25"
  },
  "estado": "pagado"
}
Ordenamiento: {"fecha":-1}
├ìndice usado: idx_pagos_cancha_estado_fecha
Documentos examinados: 575
Documentos retornados: 575
Tiempo ejecuci├│n: 2ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "cancha": 1,
      "estado": 1,
      "fecha": -1
    },
    "indexName": "idx_pagos_cancha_estado_fecha",
    "isMultiKey": false,
    "multiKeyPaths": {
      "cancha": [],
      "estado": [],
      "fecha": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "cancha": [
        "[ObjectId('6924cd563d358233f6b26942'), ObjectId('6924cd563d358233f6b26942')]"
      ],
      "estado": [
        "[\"pagado\", \"pagado\"]"
      ],
      "fecha": [
        "[\"2025-11-25\", \"2025-10-26\"]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: usuarios
==========================================================================================

Descripcion: Query: Buscar clientes por apellido (regex) - buscarClientePorNombreApellido
Query: {
  "tipo": "Cliente",
  "apellido": {
    "$regex": "Garc├¡a",
    "$options": "i"
  }
}
├ìndice usado: idx_usuarios_tipo_correo
Documentos examinados: 500000
Documentos retornados: 1634
Tiempo ejecuci├│n: 1341ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "filter": {
    "apellido": {
      "$regex": "Garc├¡a",
      "$options": "i"
    }
  },
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "tipo": 1,
      "correo": 1
    },
    "indexName": "idx_usuarios_tipo_correo",
    "isMultiKey": false,
    "multiKeyPaths": {
      "tipo": [],
      "correo": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "tipo": [
        "[\"Cliente\", \"Cliente\"]"
      ],
      "correo": [
        "[MinKey, MaxKey]"
      ]
    }
  }
}

! ALERTA: Se examinaron 500000 documentos pero solo se retornaron 1634. Considera optimizar el indice.

==========================================================================================
>> Colecci├│n: usuarios
==========================================================================================

Descripcion: Query: Buscar clientes por nombre (regex)
Query: {
  "tipo": "Cliente",
  "nombre": {
    "$regex": "Juan",
    "$options": "i"
  }
}
├ìndice usado: idx_usuarios_tipo
Documentos examinados: 500000
Documentos retornados: 8992
Tiempo ejecuci├│n: 542ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "filter": {
    "nombre": {
      "$regex": "Juan",
      "$options": "i"
    }
  },
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "tipo": 1
    },
    "indexName": "idx_usuarios_tipo",
    "isMultiKey": false,
    "multiKeyPaths": {
      "tipo": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "tipo": [
        "[\"Cliente\", \"Cliente\"]"
      ]
    }
  }
}

! ALERTA: Se examinaron 500000 documentos pero solo se retornaron 8992. Considera optimizar el indice.

==========================================================================================
>> Colecci├│n: usuarios
==========================================================================================

Descripcion: Query: Buscar cliente por correo (autenticaci├│n/login)
Query: {
  "tipo": "Cliente",
  "correo": "cliente@example.com"
}
├ìndice usado: correo_1
Documentos examinados: 0
Documentos retornados: 0
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "filter": {
    "tipo": {
      "$eq": "Cliente"
    }
  },
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "correo": 1
    },
    "indexName": "correo_1",
    "isMultiKey": false,
    "multiKeyPaths": {
      "correo": []
    },
    "isUnique": true,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "correo": [
        "[\"cliente@example.com\", \"cliente@example.com\"]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: usuarios
==========================================================================================

Descripcion: Query: Buscar clientes por nombre Y apellido (b├║squeda combinada)
Query: {
  "tipo": "Cliente",
  "nombre": {
    "$regex": "Juan",
    "$options": "i"
  },
  "apellido": {
    "$regex": "Garc├¡a",
    "$options": "i"
  }
}
├ìndice usado: idx_usuarios_tipo_apellido
Documentos examinados: 1634
Documentos retornados: 25
Tiempo ejecuci├│n: 1042ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "filter": {
    "nombre": {
      "$regex": "Juan",
      "$options": "i"
    }
  },
  "inputStage": {
    "stage": "IXSCAN",
    "filter": {
      "apellido": {
        "$regex": "Garc├¡a",
        "$options": "i"
      }
    },
    "keyPattern": {
      "tipo": 1,
      "apellido": 1
    },
    "indexName": "idx_usuarios_tipo_apellido",
    "isMultiKey": false,
    "multiKeyPaths": {
      "tipo": [],
      "apellido": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "tipo": [
        "[\"Cliente\", \"Cliente\"]"
      ],
      "apellido": [
        "[\"\", {})",
        "[/Garc├¡a/i, /Garc├¡a/i]"
      ]
    }
  }
}

! ALERTA: Se examinaron 1634 documentos pero solo se retornaron 25. Considera optimizar el indice.

==========================================================================================
>> Colecci├│n: usuarios
==========================================================================================

Descripcion: Query: Login por correo (sin filtro de tipo)
Query: {
  "correo": "cliente@example.com"
}
├ìndice usado: Ninguno (COLLSCAN)
Documentos examinados: 0
Documentos retornados: 0
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "EXPRESS_IXSCAN",
  "keyPattern": "{ correo: 1 }",
  "indexName": "correo_1"
}

! SUGERENCIA: Esta consulta NO usa indice. Considera crear uno adecuado.

==========================================================================================
>> Colecci├│n: canchas
==========================================================================================

Descripcion: Query: Buscar canchas por tipo de deporte
Query: {
  "tipo": "F├║tbol"
}
├ìndice usado: idx_canchas_tipo
Documentos examinados: 0
Documentos retornados: 0
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "tipo": 1
    },
    "indexName": "idx_canchas_tipo",
    "isMultiKey": false,
    "multiKeyPaths": {
      "tipo": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "tipo": [
        "[\"F├║tbol\", \"F├║tbol\"]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: canchas
==========================================================================================

Descripcion: Query: Listar canchas activas/disponibles
Query: {
  "estado": "activo"
}
├ìndice usado: idx_canchas_estado
Documentos examinados: 0
Documentos retornados: 0
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "estado": 1
    },
    "indexName": "idx_canchas_estado",
    "isMultiKey": false,
    "multiKeyPaths": {
      "estado": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "estado": [
        "[\"activo\", \"activo\"]"
      ]
    }
  }
}


==========================================================================================
>> Colecci├│n: canchas
==========================================================================================

Descripcion: Query: Buscar canchas activas de un tipo espec├¡fico
Query: {
  "estado": "activo",
  "tipo": "F├║tbol"
}
├ìndice usado: idx_canchas_estado_tipo
Documentos examinados: 0
Documentos retornados: 0
Tiempo ejecuci├│n: 0ms
Plan:
{
  "isCached": false,
  "stage": "FETCH",
  "inputStage": {
    "stage": "IXSCAN",
    "keyPattern": {
      "estado": 1,
      "tipo": 1
    },
    "indexName": "idx_canchas_estado_tipo",
    "isMultiKey": false,
    "multiKeyPaths": {
      "estado": [],
      "tipo": []
    },
    "isUnique": false,
    "isSparse": false,
    "isPartial": false,
    "indexVersion": 2,
    "direction": "forward",
    "indexBounds": {
      "estado": [
        "[\"activo\", \"activo\"]"
      ],
      "tipo": [
        "[\"F├║tbol\", \"F├║tbol\"]"
      ]
    }
  }
}


>> Analisis completo.

