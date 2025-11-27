========================================
  PRUEBA DE FAILOVER - MONGODB
========================================

PASO 1: Verificando estado inicial del Replica Set
---------------------------------------------------
mongo-primary:27017: PRIMARY
mongo-secondary1:27017: SECONDARY
mongo-secondary2:27017: SECONDARY

PASO 2: Verificando que el backend esta conectado
---------------------------------------------------
time="2025-11-23T17:07:26-03:00" level=warning msg="The \"i\" variable is not set. Defaulting to a blank string."
time="2025-11-23T17:07:26-03:00" level=warning msg="C:\\Users\\Usuario\\Documents\\gestion-canchas-hia\\backend\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"

backend_hia_service  | Ô£à MongoDB conectado: mongo-primary

Presiona ENTER para simular la falla del nodo PRIMARY...



PASO 3: Simulando falla del nodo PRIMARY
---------------------------------------------------
Deteniendo contenedor mongodb_primary_hia...
mongodb_primary_hia
Nodo PRIMARY detenido correctamente

PASO 4: Esperando eleccion de nuevo PRIMARY (15 segundos)
---------------------------------------------------
  Esperando... 15 segundos restantes
  Esperando... 14 segundos restantes
  Esperando... 13 segundos restantes
  Esperando... 12 segundos restantes
  Esperando... 11 segundos restantes
  Esperando... 10 segundos restantes
  Esperando... 9 segundos restantes
  Esperando... 8 segundos restantes
  Esperando... 7 segundos restantes
  Esperando... 6 segundos restantes
  Esperando... 5 segundos restantes
  Esperando... 4 segundos restantes
  Esperando... 3 segundos restantes
  Esperando... 2 segundos restantes
  Esperando... 1 segundos restantes

PASO 5: Verificando nuevo PRIMARY elegido
---------------------------------------------------
mongo-primary:27017: (not reachable/healthy)
mongo-secondary1:27017: PRIMARY
mongo-secondary2:27017: SECONDARY

PASO 6: Verificando reconexion del backend
---------------------------------------------------
time="2025-11-23T17:07:55-03:00" level=warning msg="The \"i\" variable is not set. Defaulting to a blank string."
time="2025-11-23T17:07:55-03:00" level=warning msg="C:\\Users\\Usuario\\Documents\\gestion-canchas-hia\\backend\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
backend_hia_service  | ­ƒƒó Mongoose conectado a MongoDB
backend_hia_service  | Ô£à MongoDB conectado: mongo-primary
backend_hia_service  | ÔÜá´©Å  MongoDB desconectado
backend_hia_service  | ­ƒƒó Mongoose conectado a MongoDB
backend_hia_service  | Ô£à Mongoose RECONECTADO a MongoDB (posible failover)

PASO 7: Probando que el backend responde
---------------------------------------------------
Backend responde correctamente - Status Code: 200

Presiona ENTER para restaurar el nodo PRIMARY original...



PASO 8: Restaurando nodo PRIMARY original
---------------------------------------------------
Iniciando contenedor mongodb_primary_hia...
mongodb_primary_hia
Nodo PRIMARY iniciado correctamente

PASO 9: Esperando sincronizacion del nodo (25 segundos)
---------------------------------------------------
  Sincronizando... 25 segundos restantes
  Sincronizando... 24 segundos restantes
  Sincronizando... 23 segundos restantes
  Sincronizando... 22 segundos restantes
  Sincronizando... 21 segundos restantes
  Sincronizando... 20 segundos restantes
  Sincronizando... 19 segundos restantes
  Sincronizando... 18 segundos restantes
  Sincronizando... 17 segundos restantes
  Sincronizando... 16 segundos restantes
  Sincronizando... 15 segundos restantes
  Sincronizando... 14 segundos restantes
  Sincronizando... 13 segundos restantes
  Sincronizando... 12 segundos restantes
  Sincronizando... 11 segundos restantes
  Sincronizando... 10 segundos restantes
  Sincronizando... 9 segundos restantes
  Sincronizando... 8 segundos restantes
  Sincronizando... 7 segundos restantes
  Sincronizando... 6 segundos restantes
  Sincronizando... 5 segundos restantes
  Sincronizando... 4 segundos restantes
  Sincronizando... 3 segundos restantes
  Sincronizando... 2 segundos restantes
  Sincronizando... 1 segundos restantes

PASO 10: Estado final del Replica Set
---------------------------------------------------
mongo-primary:27017: PRIMARY | Health: 1
mongo-secondary1:27017: SECONDARY | Health: 1
mongo-secondary2:27017: SECONDARY | Health: 1

========================================
  RESUMEN DE LA PRUEBA
========================================

Contenedores MongoDB activos:
NAMES                    STATUS
mongodb_secondary2_hia   Up 2 minutes (healthy)
mongodb_secondary1_hia   Up 2 minutes (healthy)
mongodb_primary_hia      Up 26 seconds (healthy)

Estado del backend:
time="2025-11-23T17:08:28-03:00" level=warning msg="The \"i\" variable is not set. Defaulting to a blank string."
time="2025-11-23T17:08:28-03:00" level=warning msg="C:\\Users\\Usuario\\Documents\\gestion-canchas-hia\\backend\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
backend_hia_service  | ­ƒöä Mongoose intentar├í reconectar autom├íticamente...
backend_hia_service  | ­ƒƒó Mongoose conectado a MongoDB
backend_hia_service  | Ô£à Mongoose RECONECTADO a MongoDB (posible failover)

PRUEBA DE FAILOVER COMPLETADA EXITOSAMENTE

Resultados esperados:
  1. El nodo PRIMARY original se detuvo
  2. Un nodo SECONDARY fue elegido como nuevo PRIMARY
  3. El backend se reconecto automaticamente
  4. El backend siguio respondiendo durante el failover
  5. El nodo original se restauro y se unio como SECONDARY
  6. Eventualmente recuperara su rol de PRIMARY (mayor prioridad)