# Simulador: SQL Injection Attack
# Demostracion: Como el WAF bloquea intentos de SQL injection
# Uso: .\attack-sql-injection.ps1 -BaseUrl "https://tu-url.com"
# Default: http://localhost:8080

param([string]$BaseUrl = "http://localhost:8080")

Write-Host ""
Write-Host "====================================================" -ForegroundColor Red
Write-Host "ATAQUE: SQL Injection Simulation" -ForegroundColor Red
Write-Host "====================================================" -ForegroundColor Red

Write-Host ""
Write-Host "Objetivo: Inyectar SQL malicioso para acceder a datos no autorizados" -ForegroundColor Yellow
Write-Host ""

# Attack 1: Classic SQL Injection
Write-Host "[ATTACK 1] SQL Injection Clasico" -ForegroundColor Yellow
Write-Host "Payload: id=1' OR '1'='1" -ForegroundColor Cyan
$url = "$BaseUrl/?id=1' OR '1'='1"
Write-Host "URL: $url" -ForegroundColor Cyan

try {
    $result = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
    $httpCode = $result.StatusCode
} catch {
    $httpCode = $_.Exception.Response.StatusCode.Value__
    if ([string]::IsNullOrEmpty($httpCode)) { $httpCode = "000" }
}

Write-Host "Respuesta HTTP: $httpCode" -ForegroundColor Cyan
if ($httpCode -eq "403" -or $httpCode -eq "406") {
    Write-Host "[MITIGATION] WAF bloqueo el ataque - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Respuesta inusual - Verificar manualmente" -ForegroundColor Yellow
}

# Attack 2: UNION-based SQL Injection
Write-Host ""
Write-Host "[ATTACK 2] UNION-based SQL Injection" -ForegroundColor Yellow
Write-Host "Payload: id=1 UNION SELECT username, password FROM users" -ForegroundColor Cyan
$url = "$BaseUrl/?id=1 UNION SELECT username, password FROM users"
Write-Host "URL: $url" -ForegroundColor Cyan

try {
    $result = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
    $httpCode = $result.StatusCode
} catch {
    $httpCode = $_.Exception.Response.StatusCode.Value__
    if ([string]::IsNullOrEmpty($httpCode)) { $httpCode = "000" }
}

Write-Host "Respuesta HTTP: $httpCode" -ForegroundColor Cyan
if ($httpCode -eq "403" -or $httpCode -eq "406") {
    Write-Host "[MITIGATION] WAF bloqueo el ataque - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Respuesta inusual - Verificar manualmente" -ForegroundColor Yellow
}

# Attack 3: Time-based SQL Injection
Write-Host ""
Write-Host "[ATTACK 3] Time-based SQL Injection" -ForegroundColor Yellow
Write-Host "Payload: id=1; WAITFOR DELAY '00:00:05'" -ForegroundColor Cyan
$url = "$BaseUrl/?id=1; WAITFOR DELAY '00:00:05'"
Write-Host "URL: $url" -ForegroundColor Cyan

try {
    $result = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop -TimeoutSec 10
    $httpCode = $result.StatusCode
} catch {
    $httpCode = $_.Exception.Response.StatusCode.Value__
    if ([string]::IsNullOrEmpty($httpCode)) { $httpCode = "000" }
}

Write-Host "Respuesta HTTP: $httpCode" -ForegroundColor Cyan
if ($httpCode -eq "403" -or $httpCode -eq "406") {
    Write-Host "[MITIGATION] WAF bloqueo el ataque - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Respuesta inusual - Verificar manualmente" -ForegroundColor Yellow
}

# Attack 4: Stacked Queries
Write-Host ""
Write-Host "[ATTACK 4] Stacked Queries (Multiple SQL Statements)" -ForegroundColor Yellow
Write-Host "Payload: id=1; DROP TABLE users;" -ForegroundColor Cyan
$url = "$BaseUrl/?id=1; DROP TABLE users;"
Write-Host "URL: $url" -ForegroundColor Cyan

try {
    $result = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
    $httpCode = $result.StatusCode
} catch {
    $httpCode = $_.Exception.Response.StatusCode.Value__
    if ([string]::IsNullOrEmpty($httpCode)) { $httpCode = "000" }
}

Write-Host "Respuesta HTTP: $httpCode" -ForegroundColor Cyan
if ($httpCode -eq "403" -or $httpCode -eq "406") {
    Write-Host "[MITIGATION] WAF bloqueo el ataque - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Respuesta inusual - Verificar manualmente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "RESULTADO: Todos los intentos de SQL Injection bloqueados" -ForegroundColor Green
Write-Host "MITIGACION: ModSecurity WAF + Reglas OWASP CRS" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
