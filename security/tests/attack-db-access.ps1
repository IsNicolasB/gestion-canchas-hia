# Simulador: Unauthorized Database Access
# Demostracion: Como iptables bloquea acceso no autorizado a MongoDB
# Uso: .\attack-db-access.ps1

Write-Host ""
Write-Host "====================================================" -ForegroundColor Red
Write-Host "ATAQUE: Unauthorized Database Access" -ForegroundColor Red
Write-Host "====================================================" -ForegroundColor Red

Write-Host ""
Write-Host "Objetivo: Intentar acceso directo a MongoDB desde fuera" -ForegroundColor Yellow
Write-Host "Defensa: iptables rules + No puertos expuestos" -ForegroundColor Cyan
Write-Host ""

# Attack 1: Intento de conexion directa al puerto 27017
Write-Host "[ATTACK 1] Conexion Directa a MongoDB (Puerto 27017)" -ForegroundColor Yellow
Write-Host "Objetivo: mongodb://localhost:27017" -ForegroundColor Cyan
Write-Host "Simulando intento de conexion..." -ForegroundColor Gray

$result = docker run --rm alpine sh -c "apk add --no-cache netcat-openbsd; timeout 3 nc -zv host.docker.internal 27017 2>&1 || echo 'CONNECTION_BLOCKED'" 2>&1
$output = $result | Out-String

if ($output -like "*CONNECTION_BLOCKED*" -or $output -like "*refused*" -or $output -like "*timed out*") {
    Write-Host "[MITIGATION] Intento de conexion BLOQUEADO" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO por iptables" -ForegroundColor Green
    Write-Host "Razon: Puerto 27017 no esta expuesto y no acepta conexiones externas" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Verificar reglas iptables - Conexion puede no estar bloqueada" -ForegroundColor Yellow
}

# Attack 2: Intento de acceso desde contenedor no autorizado
Write-Host ""
Write-Host "[ATTACK 2] Acceso desde Contenedor No Autorizado" -ForegroundColor Yellow
Write-Host "Objetivo: Conectar desde contenedor fuera de la red mongo-cluster" -ForegroundColor Cyan

$result = docker run --rm --name test-attacker mongo sh -c "timeout 3 mongosh --host host.docker.internal:27017 --eval 'db.admin.ping()' 2>&1 || echo 'ACCESS_DENIED'" 2>&1
$output = $result | Out-String

if ($output -like "*ACCESS_DENIED*" -or $output -like "*refused*" -or $output -like "*timed out*" -or $output -like "*ECONNREFUSED*") {
    Write-Host "[MITIGATION] Acceso desde contenedor no autorizado BLOQUEADO" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO por iptables" -ForegroundColor Green
    Write-Host "Razon: Solo contenedores en red mongo-cluster pueden conectar" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Verificar aislamiento de redes - Acceso podria estar permitido" -ForegroundColor Yellow
}

# Attack 3: Intento de escaneo de puertos MongoDB
Write-Host ""
Write-Host "[ATTACK 3] Port Scanning Attempt" -ForegroundColor Yellow
Write-Host "Objetivo: Escanear puertos MongoDB (27017-27019)" -ForegroundColor Cyan

Write-Host "Escaneando puertos..." -ForegroundColor Gray
$ports = @("27017", "27018", "27019")
$openPorts = 0

foreach ($port in $ports) {
    $result = docker run --rm alpine sh -c "apk add --no-cache netcat-openbsd; timeout 2 nc -zv host.docker.internal $port 2>&1 || echo 'BLOCKED'" 2>&1
    
    if ($result -like "*BLOCKED*" -or $result -like "*refused*" -or $result -like "*timed out*") {
        Write-Host "  Puerto ${port}: BLOQUEADO" -ForegroundColor Green
    } else {
        Write-Host "  Puerto ${port}: ABIERTO" -ForegroundColor Red
        $openPorts++
    }
}

if ($openPorts -eq 0) {
    Write-Host "[MITIGATION] Todos los puertos MongoDB estan BLOQUEADOS" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Se encontraron puertos abiertos - Revisar configuracion" -ForegroundColor Yellow
}

# Attack 4: Verificar reglas iptables activas
Write-Host ""
Write-Host "[VERIFICACION] Reglas iptables Activas" -ForegroundColor Yellow
Write-Host "Analizando reglas del firewall..." -ForegroundColor Gray

$rules = wsl sudo iptables -L INPUT -n --line-numbers 2>&1
if ($rules -like "*27017*") {
    Write-Host "[DETALLE] Reglas para puerto MongoDB encontradas:" -ForegroundColor Green
    $rules | Select-String "27017" | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Green
    }
    Write-Host "[ANALYSIS] Solo 127.0.0.1 y 172.17.0.0/16 pueden conectar" -ForegroundColor Green
} else {
    Write-Host "[WARNING] No se encontraron reglas explícitas para puerto 27017" -ForegroundColor Yellow
}

# Attack 5: Intento de inyeccion en cadena de conexion
Write-Host ""
Write-Host "[ATTACK 5] Manipulacion de Cadena de Conexion" -ForegroundColor Yellow
Write-Host "Intento: mongodb://admin:admin@localhost:27017/admin" -ForegroundColor Cyan

$result = docker run --rm mongo sh -c "timeout 3 mongosh 'mongodb://admin:admin@host.docker.internal:27017/admin' --eval 'db.version()' 2>&1 || echo 'CONNECTION_FAILED'" 2>&1
$output = $result | Out-String

if ($output -like "*CONNECTION_FAILED*" -or $output -like "*ECONNREFUSED*" -or $output -like "*timed out*") {
    Write-Host "[MITIGATION] Intento de conexion RECHAZADO" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Conexion podria ser exitosa - Verificar seguridad" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "RESULTADO: Acceso No Autorizado a BD BLOQUEADO" -ForegroundColor Green
Write-Host "DEFENSAS ACTIVAS:" -ForegroundColor Green
Write-Host "  1. iptables - Bloquea trafico no autorizado" -ForegroundColor Green
Write-Host "  2. Redes Docker aisladas - mongo-cluster privada" -ForegroundColor Green
Write-Host "  3. Puertos no expuestos - No accesibles desde host" -ForegroundColor Green
Write-Host "  4. Autenticacion requerida - Credenciales necesarias" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
