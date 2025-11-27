# Replicación y Failover en MongoDB (Replica Set)

Fecha: 26-11-2025  
Autor: GitHub Copilot  
Estado: Operativo

## Objetivo
Diseñar y operar un clúster de MongoDB con alta disponibilidad utilizando Replica Set (1 primario + 2 secundarios) y un proceso automatizado de inicialización y failover, integrado mediante Docker Compose.

## Resumen Ejecutivo
- Arquitectura: `mongo-primary` + `mongo-secondary1` + `mongo-secondary2` + `mongo-setup`
- Modo: Replica Set `rs0`
- Alta disponibilidad: Elección automática de nuevo primario si el actual falla (failover)
- Seguridad operativa: Usuario `admin` (root) creado por `mongo-setup`
- Observabilidad: Healthchecks en todos los nodos
- Backend: conecta usando cadena con tres hosts + `replicaSet=rs0`

## ¿Por qué replicación?
- Tolerancia a fallos: si el nodo primario cae, un secundario asciende automáticamente a primario.
- Continuidad de servicio: el backend sigue pudiendo leer/escribir (dependiendo del driver y configuración de write concern) sin caída prolongada.
- Seguridad de datos: múltiples copias con sincronización mediante el protocolo de replicación de MongoDB.
- Escalabilidad de lectura: secundarios pueden servir lecturas (según política aplicada en la app).

## Componentes (Docker Compose)

### 1. `mongo-primary`
- Imagen: `mongo:latest`
- Puertos: `27017:27017`
- Comando: `mongod --replSet rs0 --bind_ip_all --wiredTigerCacheSizeGB 2`
- Volúmenes: datos y config
- Healthcheck: `mongosh ... db.runCommand("ping").ok`
- Recursos: límites y reservas

### 2. `mongo-secondary1`
- Imagen: `mongo:latest`
- Puerto host: `27018` mapeado a `27017` dentro del contenedor
- Comando: `mongod --replSet rs0 --bind_ip_all --wiredTigerCacheSizeGB 1`
- Depende de `mongo-primary`
- Healthcheck activo

### 3. `mongo-secondary2`
- Imagen: `mongo:latest`
- Puerto host: `27019` → `27017` contenedor
- Comando: `mongod --replSet rs0 --bind_ip_all --wiredTigerCacheSizeGB 1`
- Depende de `mongo-primary`
- Healthcheck activo

### 4. `mongo-setup` (Inicialización del Replica Set)
- Script de entrada (`entrypoint`) que:
  1. Espera healthchecks de los tres nodos
  2. Ejecuta `rs.initiate` con configuración de miembros y prioridades
  3. Espera ~40s para elección de primario
  4. Crea usuario `devuser/devpass` con rol root en `admin`
- Idempotente: maneja `AlreadyInitialized`

## Configuración del Replica Set

Replica Set ID: `rs0`

Miembros y prioridades:
- `_id:0` `mongo-primary:27017` → `priority: 2` (preferido como primario)
- `_id:1` `mongo-secondary1:27017` → `priority: 1`
- `_id:2` `mongo-secondary2:27017` → `priority: 1`

Esto favorece que `mongo-primary` sea elegido primario en condiciones normales. Ante caída, uno de los secundarios será promovido automáticamente.

## Conexión del Backend (Node.js)

Cadena de conexión (en `docker-compose.yml` → servicio `backend`):
```
MONGODB_URI: mongodb://devuser:devpass@mongo-primary:27017,mongo-secondary1:27017,mongo-secondary2:27017/mi_app_db?replicaSet=rs0&authSource=admin&retryWrites=true&w=majority
```

Claves de la URI:
- Lista de hosts: primario + secundarios
- `replicaSet=rs0`: habilita replicación en el driver
- `authSource=admin`: autenticación contra la DB `admin`
- `retryWrites=true`: reintentos automáticos de escrituras (cuando es soportado)
- `w=majority`: confirma escrituras en mayoría de nodos (mayor durabilidad)

## Flujo de Operación

1. Docker Compose levanta `mongo-primary`, `mongo-secondary1`, `mongo-secondary2`.
2. Healthchecks verifican `ping` de cada nodo.
3. `mongo-setup` corre y ejecuta `rs.initiate` + creación de usuario admin.
4. El cluster `rs0` queda operativo con un primario electo.
5. El backend se conecta usando la URI con los tres hosts y opera normalmente.

## Failover: ¿Qué ocurre ante una caída?

- Si `mongo-primary` falla:
  - Los secundarios detectan la ausencia del primario.
  - Se inicia una elección; uno de los secundarios asume primario.
  - El backend, al tener múltiples hosts en la URI y usar el driver de Mongo, reintenta/redistribuye la conexión hacia el nuevo primario.
- Cuando `mongo-primary` regresa:
  - Puede reingresar como secundario; si se desea, por prioridad puede ser promovido en una elección posterior.

## Cómo probar el Failover (guía paso a paso)

Requisitos: Docker Desktop funcionando, entorno levantado.

1) Levantar el stack:
```powershell
cd backend
docker compose up -d mongo-primary mongo-secondary1 mongo-secondary2 mongo-setup
```

2) Confirmar estado del Replica Set:
```powershell
docker compose exec mongo-primary mongosh --eval "rs.status()"
```
Debe mostrar un miembro `PRIMARY` y dos `SECONDARY`.

3) Probar operaciones básicas desde el backend (ya corriendo):
```powershell
curl http://localhost:3000/health
curl http://localhost:3000/canchas
```

4) Simular caída del primario:
```powershell
docker compose stop mongo-primary
```

5) Observar nueva elección:
```powershell
docker compose exec mongo-secondary1 mongosh --eval "rs.status()"
docker compose exec mongo-secondary2 mongosh --eval "rs.status()"
```
Uno debería aparecer como `PRIMARY` tras la elección (~10-30s).

6) Validar continuidad del backend:
```powershell
curl http://localhost:3000/health
curl http://localhost:3000/canchas
```
Debería seguir respondiendo (puede haber un breve “hiccup” durante la elección).

7) Restaurar el primario original:
```powershell
docker compose start mongo-primary
```

8) Ver estado final y sincronización:
```powershell
docker compose exec mongo-primary mongosh --eval "rs.status()"
```

## Healthchecks y Robustez

Cada nodo MongoDB tiene un healthcheck que ejecuta `db.runCommand("ping")`. Esto permite a Docker Compose:
- Ordenar dependencias (no iniciar `mongo-setup` hasta que los nodos estén `healthy`)
- Detectar estados no operativos y evitar inicialización prematura

## Consideraciones de Recursos
- `mongo-primary`: más memoria y CPU reservadas
- Secundarios: memoria/CPU moderadas
- Ajustes de `wiredTigerCacheSizeGB` para balancear consumo de RAM

## Buenas Prácticas
- Mantener `priority` mayor en el nodo que se desea como primario habitual.
- Usar `w=majority` cuando la durabilidad sea prioritaria.
- Evitar operaciones largas en el primario que bloqueen elecciones.
- Monitorear `rs.status()` y logs para detectar problemas de red o desfase.

## Problemas Comunes y Soluciones

1) `AlreadyInitialized` al correr `rs.initiate`:
- El script ya contempla esta condición; no es crítico.

2) Elección tarda demasiado:
- Verificar conectividad entre contenedores y reloj del sistema.
- Revisar logs (`docker compose logs mongo-*`).

3) Backend falla en reconectarse:
- Confirmar URI con los tres hosts y `replicaSet=rs0`.
- Verificar que Docker Desktop/WSL esté estable.

4) Desfase de datos en secundarios:
- Normal en períodos de alta escritura; verificar `optimeDate` en `rs.status()`.

## Integración con Otros Servicios

- `redis`: cache de lectura, independiente del Replica Set, mejora latencias del backend, y ayuda a mitigar picos durante elecciones breves.
- `mongo-express`: GUI opcional para ver datos en el primario.

## Comandos Útiles

Estado del Replica Set:
```powershell
docker compose exec mongo-primary mongosh --eval "rs.status()"
```

Rol de cada miembro:
```powershell
docker compose exec mongo-primary mongosh --eval "db.isMaster()"
```

Logs de Mongo:
```powershell
docker compose logs -f mongo-primary
```

Parar/arrancar nodos:
```powershell
docker compose stop mongo-secondary1
docker compose start mongo-secondary1
```

## Conclusión
La arquitectura de Replica Set implementada aporta alta disponibilidad y resiliencia ante fallos, con una inicialización automatizada y controles de salud. El backend está configurado para aprovechar esta topología, manteniendo continuidad de servicio durante eventos de failover.
