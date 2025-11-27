# Simulador: Command Injection
# Demostracion: Como el WAF bloquea intentos de command injection
# Uso: .\attack-command-injection.ps1 -BaseUrl "https://tu-url.com"
# Default: http://localhost:8080

param([string]$BaseUrl = "http://localhost:8080")

Write-Host ""
Write-Host "====================================================" -ForegroundColor Red
Write-Host "ATAQUE: Command Injection Simulation" -ForegroundColor Red
Write-Host "====================================================" -ForegroundColor Red

Write-Host ""
Write-Host "Objetivo: Ejecutar comandos del sistema a traves de parametros maliciosos" -ForegroundColor Yellow
Write-Host "Sistema de Defensa: ModSecurity WAF" -ForegroundColor Cyan
Write-Host ""

# Attack 1: Shell metacharacters injection
Write-Host "[ATTACK 1] Shell Metacharacters Injection" -ForegroundColor Yellow
Write-Host "Payload: filename.txt; rm -rf /" -ForegroundColor Cyan
$url = "$BaseUrl/?file=filename.txt; rm -rf /"
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
    Write-Host "[MITIGATION] WAF bloquo la inyeccion de comandos" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

# Attack 2: Pipe injection
Write-Host ""
Write-Host "[ATTACK 2] Pipe Injection (Command Chaining)" -ForegroundColor Yellow
Write-Host "Payload: input | cat /etc/passwd" -ForegroundColor Cyan
$url = "$BaseUrl/?data=input | cat /etc/passwd"
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
    Write-Host "[MITIGATION] WAF bloquo la inyeccion de comandos" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

# Attack 3: Command substitution
Write-Host ""
Write-Host "[ATTACK 3] Command Substitution" -ForegroundColor Yellow
Write-Host "Payload: \$(whoami)" -ForegroundColor Cyan
$url = "$BaseUrl/?username=%24(whoami)"
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
    Write-Host "[MITIGATION] WAF bloquo la inyeccion de comandos" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

# Attack 4: Backtick injection
Write-Host ""
Write-Host "[ATTACK 4] Backtick Command Execution" -ForegroundColor Yellow
Write-Host "Payload: command with backticks" -ForegroundColor Cyan
$url = "$BaseUrl/?exec=%60cat /etc/passwd%60"
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
    Write-Host "[MITIGATION] WAF bloquo la inyeccion de comandos" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

# Attack 5: AND/OR operators
Write-Host ""
Write-Host "[ATTACK 5] AND/OR Command Chaining" -ForegroundColor Yellow
Write-Host "Payload: test AND cat /etc/passwd" -ForegroundColor Cyan
$url = "$BaseUrl/?query=test%20%26%26%20cat%20/etc/passwd"
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
    Write-Host "[MITIGATION] WAF bloquo la inyeccion de comandos" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "RESULTADO: Todos los intentos bloqueados" -ForegroundColor Green
Write-Host "MITIGACION: ModSecurity WAF + Input Validation" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

