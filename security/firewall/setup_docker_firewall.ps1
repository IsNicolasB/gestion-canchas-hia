# security/firewall/setup_docker_firewall.ps1
Write-Host "Configurando reglas de firewall para Docker en Windows"

# Verificar si el script se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Por favor, ejecuta este script como administrador" -ForegroundColor Red
    exit 1
}

# Obtener la red de Docker
$dockerNetwork = docker network inspect bridge --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>$null
if (-not $dockerNetwork) {
    Write-Host "No se pudo obtener la red de Docker. Asegúrate de que Docker esté en ejecución." -ForegroundColor Red
    exit 1
}

Write-Host "Red de Docker: $dockerNetwork"

# Crear reglas para MongoDB (puerto 27017)
Write-Host "`nConfigurando reglas para MongoDB (puerto 27017)..."

# Bloquear todo el tráfico externo
New-NetFirewallRule -DisplayName "Bloquear MongoDB Externo" -Direction Inbound -LocalPort 27017 -Protocol TCP -Action Block -ErrorAction SilentlyContinue

# Permitir solo desde la red de Docker
New-NetFirewallRule -DisplayName "Permitir MongoDB desde red Docker" -Direction Inbound -LocalPort 27017 -Protocol TCP -Action Allow -RemoteAddress $dockerNetwork -ErrorAction SilentlyContinue

# Crear reglas para Redis (puerto 6379)
Write-Host "`nConfigurando reglas para Redis (puerto 6379)..."

# Bloquear todo el tráfico externo
New-NetFirewallRule -DisplayName "Bloquear Redis Externo" -Direction Inbound -LocalPort 6379 -Protocol TCP -Action Block -ErrorAction SilentlyContinue

# Permitir solo desde localhost
New-NetFirewallRule -DisplayName "Permitir Redis desde localhost" -Direction Inbound -LocalPort 6379 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1 -ErrorAction SilentlyContinue

# Crear reglas para el backend (puerto 3000)
Write-Host "`nConfigurando reglas para el Backend (puerto 3000)..."

# Bloquear todo el tráfico externo
New-NetFirewallRule -DisplayName "Bloquear Backend Externo" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Block -ErrorAction SilentlyContinue

# Permitir solo desde localhost
New-NetFirewallRule -DisplayName "Permitir Backend desde localhost" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1 -ErrorAction SilentlyContinue

# Mostrar resumen
Write-Host "`nResumen de reglas configuradas:" -ForegroundColor Green
Get-NetFirewallRule -DisplayName "Bloquear *","Permitir *" | Format-Table DisplayName, Enabled, Direction, Action, Protocol, LocalPort, RemoteAddress -AutoSize

Write-Host "`nConfiguracion de firewall completada" -ForegroundColor Green