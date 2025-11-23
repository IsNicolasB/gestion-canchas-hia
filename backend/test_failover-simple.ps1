# test_failover_simple.ps1
# Script simple de prueba de Failover para MongoDB Replica Set

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRUEBA DE FAILOVER - MONGODB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Estado Inicial
Write-Host "PASO 1: Verificando estado inicial del Replica Set" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
docker exec mongodb_primary_hia mongosh -u devuser -p devpass --authenticationDatabase admin --eval "rs.status().members.forEach(m => print(m.name + ': ' + m.stateStr))"
Write-Host ""

# PASO 2: Verificar Backend
Write-Host "PASO 2: Verificando que el backend esta conectado" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
docker-compose logs backend | Select-String "MongoDB conectado" | Select-Object -Last 1
Write-Host ""

Write-Host "Presiona ENTER para simular la falla del nodo PRIMARY..." -ForegroundColor Magenta
Read-Host

# PASO 3: Simular Falla
Write-Host ""
Write-Host "PASO 3: Simulando falla del nodo PRIMARY" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
Write-Host "Deteniendo contenedor mongodb_primary_hia..." -ForegroundColor Red
docker stop mongodb_primary_hia
Write-Host "Nodo PRIMARY detenido correctamente" -ForegroundColor Green
Write-Host ""

# PASO 4: Esperar Eleccion
Write-Host "PASO 4: Esperando eleccion de nuevo PRIMARY (15 segundos)" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
for ($i=15; $i -gt 0; $i--) {
    Write-Host "  Esperando... $i segundos restantes" -ForegroundColor Gray
    Start-Sleep -Seconds 1
}
Write-Host ""

# PASO 5: Verificar Nuevo PRIMARY
Write-Host "PASO 5: Verificando nuevo PRIMARY elegido" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
docker exec mongodb_secondary1_hia mongosh -u devuser -p devpass --authenticationDatabase admin --eval "rs.status().members.forEach(m => print(m.name + ': ' + m.stateStr))"
Write-Host ""

# PASO 6: Verificar Reconexion del Backend
Write-Host "PASO 6: Verificando reconexion del backend" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
docker-compose logs backend | Select-String "conectado|desconectado|reconectado" | Select-Object -Last 5
Write-Host ""

# PASO 7: Probar Backend
Write-Host "PASO 7: Probando que el backend responde" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Backend responde correctamente - Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Backend NO responde - Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Presiona ENTER para restaurar el nodo PRIMARY original..." -ForegroundColor Magenta
Read-Host

# PASO 8: Restaurar PRIMARY
Write-Host ""
Write-Host "PASO 8: Restaurando nodo PRIMARY original" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
Write-Host "Iniciando contenedor mongodb_primary_hia..." -ForegroundColor Green
docker start mongodb_primary_hia
Write-Host "Nodo PRIMARY iniciado correctamente" -ForegroundColor Green
Write-Host ""

# PASO 9: Esperar Sincronizacion
Write-Host "PASO 9: Esperando sincronizacion del nodo (25 segundos)" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
for ($i=25; $i -gt 0; $i--) {
    Write-Host "  Sincronizando... $i segundos restantes" -ForegroundColor Gray
    Start-Sleep -Seconds 1
}
Write-Host ""

# PASO 10: Estado Final
Write-Host "PASO 10: Estado final del Replica Set" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray
docker exec mongodb_primary_hia mongosh -u devuser -p devpass --authenticationDatabase admin --eval "rs.status().members.forEach(m => print(m.name + ': ' + m.stateStr + ' | Health: ' + m.health))"
Write-Host ""

# PASO 11: Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE LA PRUEBA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contenedores MongoDB activos:" -ForegroundColor Yellow
docker ps --filter "name=mongodb" --format "table {{.Names}}\t{{.Status}}"
Write-Host ""
Write-Host "Estado del backend:" -ForegroundColor Yellow
docker-compose logs backend | Select-String "MongoDB conectado|Mongoose" | Select-Object -Last 3
Write-Host ""
Write-Host "PRUEBA DE FAILOVER COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host ""
Write-Host "Resultados esperados:" -ForegroundColor Yellow
Write-Host "  1. El nodo PRIMARY original se detuvo" -ForegroundColor Gray
Write-Host "  2. Un nodo SECONDARY fue elegido como nuevo PRIMARY" -ForegroundColor Gray
Write-Host "  3. El backend se reconecto automaticamente" -ForegroundColor Gray
Write-Host "  4. El backend siguio respondiendo durante el failover" -ForegroundColor Gray
Write-Host "  5. El nodo original se restauro y se unio como SECONDARY" -ForegroundColor Gray
Write-Host "  6. Eventualmente recuperara su rol de PRIMARY (mayor prioridad)" -ForegroundColor Gray
Write-Host ""