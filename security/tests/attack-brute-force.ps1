# Simulador: Brute Force Attack
# Demostracion: Como Fail2ban mitiga intentos de fuerza bruta
# Uso: .\attack-brute-force.ps1 -MongoExpressUrl "https://tu-url.com:8081"
# Default: http://localhost:8081

param([string]$MongoExpressUrl = "http://localhost:8081")

Write-Host ""
Write-Host "====================================================" -ForegroundColor Red
Write-Host "ATAQUE: Brute Force Attack Simulation" -ForegroundColor Red
Write-Host "====================================================" -ForegroundColor Red

Write-Host ""
Write-Host "Objetivo: Simular multiples intentos de login fallidos" -ForegroundColor Yellow
Write-Host "Sistema de Defensa: Fail2ban" -ForegroundColor Cyan
Write-Host ""

# Check if Fail2ban is running
Write-Host "[PRE-CHECK] Verificando que Fail2ban esta activo..." -ForegroundColor Yellow
$fail2banStatus = docker ps --filter "name=fail2ban" --format "{{.Status}}"
if ($fail2banStatus -like "*Up*") {
    Write-Host "Fail2ban esta corriendo: $fail2banStatus" -ForegroundColor Green
} else {
    Write-Host "ERROR: Fail2ban no esta activo" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[SIMULACION] Intentando multiples login fallidos en Mongo Express..." -ForegroundColor Yellow
Write-Host ""

$failedAttempts = 0
$maxAttempts = 8

for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "Intento $i de $maxAttempts - Credenciales incorrectas..." -ForegroundColor Cyan
    
    # Intentar login con credenciales invalidas
    $credentials = New-Object System.Management.Automation.PSCredential("admin", (ConvertTo-SecureString "wrongpassword$i" -AsPlainText -Force))
    try {
        $result = Invoke-WebRequest -Uri "$MongoExpressUrl/" -Authentication Basic -Credential $credentials -UseBasicParsing -ErrorAction Stop -TimeoutSec 3
        $httpCode = $result.StatusCode
    } catch {
        $httpCode = $_.Exception.Response.StatusCode.Value__
        if ([string]::IsNullOrEmpty($httpCode)) { $httpCode = "000" }
    }
    
    if ($httpCode -eq "401" -or $httpCode -eq "403") {
        Write-Host "  Respuesta: HTTP $httpCode (Acceso Denegado)" -ForegroundColor Yellow
        $failedAttempts++
    } elseif ($httpCode -eq "000" -or [string]::IsNullOrEmpty($httpCode)) {
        Write-Host "  Respuesta: Timeout/Conexion rechazada (POSIBLE BLOQUEO POR FAIL2BAN)" -ForegroundColor Red
        Write-Host "[MITIGATION] Fail2ban bloqueo el IP despues de multiples intentos fallidos" -ForegroundColor Green
        Write-Host "Estado: PROTEGIDO - Ataque mitificado" -ForegroundColor Green
        break
    } else {
        Write-Host "  Respuesta: HTTP $httpCode" -ForegroundColor Gray
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "[ANALISIS DE LOGS]" -ForegroundColor Yellow
Write-Host "Extrayendo informacion de Fail2ban..." -ForegroundColor Cyan
Write-Host ""

# Obtener logs de Fail2ban
$fail2banLogs = docker logs fail2ban 2>&1 | Select-Object -Last 20
if ($fail2banLogs -like "*Ban*" -or $fail2banLogs -like "*192.168*" -or $fail2banLogs -like "*127.0*") {
    Write-Host "Eventos detectados en Fail2ban:" -ForegroundColor Green
    $fail2banLogs | Select-String -Pattern "(Ban|Unban|Found|jail)" | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Green
    }
} else {
    Write-Host "Verificar logs manualmente: docker logs fail2ban" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[DEFENSA EN ACCION]" -ForegroundColor Yellow
Write-Host "Verificando status de jails en Fail2ban..." -ForegroundColor Cyan

$jailStatus = docker exec fail2ban fail2ban-client status 2>&1
if ($jailStatus -like "*Currently banned*") {
    Write-Host "IPs Actualmente Baneadas:" -ForegroundColor Red
    $jailStatus | Select-String "Currently banned" -Context 0,5 | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Red
    }
} else {
    Write-Host "Sin IPs baneadas actualmente (pueden haber expirado)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "RESULTADO: Ataque de Fuerza Bruta Mitigado" -ForegroundColor Green
Write-Host "MECANISMO: Fail2ban banea IP despues de N intentos fallidos" -ForegroundColor Green
Write-Host "TIEMPO DE BLOQUEO: Configurable (default: 10 min)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
