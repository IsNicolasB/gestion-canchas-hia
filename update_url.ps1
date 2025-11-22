# Script para automatizar la actualización de APP_URL con la URL de Cloudflared

Write-Host "Levantando DB y túnel..."
docker compose up -d mantis_db mantis_tunnel

Write-Host "Esperando 15 segundos a que Cloudflared genere la URL..."
Start-Sleep -Seconds 15

# Obtener el nombre del contenedor de Cloudflared
$container = 'mantis_tunnel'

if (-not $container) {
    Write-Host "Error: No se encontró el contenedor de Cloudflared."
    exit 1
}

Write-Host "Contenedor de Cloudflared: $container"

# Obtener los logs y buscar la URL
$logs = docker logs $container 2>&1
Write-Host "Buscando URL en logs..."
$line = $logs | Select-String "trycloudflare.com" | Select-Object -Last 1
if ($line) {
    $line = $line.Line
}
Write-Host "Línea encontrada: '$line'"
$url = $line -replace ".*https://([^\s]+).*", 'https://$1'
Write-Host "URL extraída: '$url'"
if (-not $url -or $url -eq $line -or $url -notmatch "^https://") {
    Write-Host "Error: No se pudo extraer la URL válida."
    exit 1
}

Write-Host "URL encontrada: $url"

# Leer .env
$content = Get-Content -Path ".env" -Raw

# Reemplazar la línea APP_URL (formato de .env: APP_URL=...)
$oldLine = "APP_URL=.*"
$newLine = "APP_URL=$url"
$content = $content -replace $oldLine, $newLine

# Escribir de vuelta a .env
$content | Set-Content -Path ".env"

Write-Host "Actualizado .env con APP_URL: $url"

# Levantar MantisBT con la nueva URL
Write-Host "Levantando MantisBT con la nueva URL..."
docker compose up -d mantisbt

Write-Host "¡Listo! MantisBT ahora usa la URL externa."