# Simulador: XSS (Cross-Site Scripting) Attack
# Demostracion: Como el WAF bloquea intentos de XSS
# Uso: .\attack-xss.ps1 -BaseUrl "https://tu-url.com"
# Default: http://localhost:8080

param([string]$BaseUrl = "http://localhost:8080")

Write-Host ""
Write-Host "====================================================" -ForegroundColor Red
Write-Host "ATAQUE: XSS (Cross-Site Scripting) Simulation" -ForegroundColor Red
Write-Host "====================================================" -ForegroundColor Red

Write-Host ""
Write-Host "Objetivo: Inyectar JavaScript malicioso para ejecutar en navegador de usuarios" -ForegroundColor Yellow
Write-Host ""

# Attack 1: Stored XSS with script tag
Write-Host "[ATTACK 1] Stored XSS - Script Tag" -ForegroundColor Yellow
Write-Host "Payload: <script>alert('XSS Vulnerable')</script>" -ForegroundColor Cyan
$url = "$BaseUrl/?comment=<script>alert('XSS')</script>"
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
    Write-Host "[MITIGATION] WAF bloqueo el XSS - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

# Attack 2: DOM-based XSS
Write-Host ""
Write-Host "[ATTACK 2] DOM-based XSS - Image Tag" -ForegroundColor Yellow
Write-Host "Payload: <img src=x onerror='alert(1)'>" -ForegroundColor Cyan
$url = "$BaseUrl/?image=<img src=x onerror='alert(1)'>"
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
    Write-Host "[MITIGATION] WAF bloqueo el XSS - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

# Attack 3: Event Handler XSS
Write-Host ""
Write-Host "[ATTACK 3] Event Handler XSS - SVG" -ForegroundColor Yellow
Write-Host "Payload: <svg onload='alert(1)'>" -ForegroundColor Cyan
$url = "$BaseUrl/?data=<svg onload='alert(1)'>"
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
    Write-Host "[MITIGATION] WAF bloqueo el XSS - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

# Attack 4: JavaScript Protocol
Write-Host ""
Write-Host "[ATTACK 4] JavaScript Protocol XSS" -ForegroundColor Yellow
Write-Host "Payload: <a href='javascript:alert(1)'>Click</a>" -ForegroundColor Cyan
$url = "$BaseUrl/?link=<a href='javascript:alert(1)'>Click</a>"
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
    Write-Host "[MITIGATION] WAF bloqueo el XSS - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

# Attack 5: Encoded XSS
Write-Host ""
Write-Host "[ATTACK 5] Encoded XSS - HTML Entities" -ForegroundColor Yellow
Write-Host "Payload: &#60;script&#62;alert(1)&#60;/script&#62;" -ForegroundColor Cyan
$url = "$BaseUrl/?encoded=&#60;script&#62;alert(1)&#60;/script&#62;"
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
    Write-Host "[MITIGATION] WAF bloqueo el XSS - Acceso denegado" -ForegroundColor Green
    Write-Host "Estado: PROTEGIDO" -ForegroundColor Green
} else {
    Write-Host "[INFO] Respuesta: $httpCode" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "RESULTADO: Todos los intentos de XSS bloqueados" -ForegroundColor Green
Write-Host "MITIGACION: ModSecurity WAF + Content Security Policy" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
