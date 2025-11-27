# Master Attack Simulation Suite
# Ejecuta todas las simulaciones de ataque y muestra como se mitigan
# Uso: .\run-attack-simulations.ps1 -BaseUrl "https://tu-url.com" -MongoExpressUrl "https://tu-url.com:8081"
# Default: http://localhost:8080 y http://localhost:8081

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$MongoExpressUrl = "http://localhost:8081"
)

Write-Host ""
Write-Host "====================================================" -ForegroundColor Red
Write-Host "    SECURITY ATTACK SIMULATION SUITE" -ForegroundColor Red
Write-Host "====================================================" -ForegroundColor Red
Write-Host ""
Write-Host "WAF Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Mongo Express URL: $MongoExpressUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script simula ataques comunes contra la aplicacion" -ForegroundColor Yellow
Write-Host "y muestra como los sistemas de seguridad los mitigan." -ForegroundColor Yellow
Write-Host ""
Write-Host "ADVERTENCIA: Esto es para propositos educativos y de prueba" -ForegroundColor Yellow
Write-Host "Solo se debe ejecutar en ambientes de desarrollo/testing" -ForegroundColor Yellow
Write-Host ""

$attackScripts = @(
    @{
        Name = "SQL Injection";
        File = "attack-sql-injection.ps1";
        Description = "Intenta inyectar codigo SQL malicioso"
    },
    @{
        Name = "XSS (Cross-Site Scripting)";
        File = "attack-xss.ps1";
        Description = "Intenta inyectar JavaScript malicioso"
    },
    @{
        Name = "Command Injection";
        File = "attack-command-injection.ps1";
        Description = "Intenta ejecutar comandos del sistema"
    },
    @{
        Name = "Database Access Attack";
        File = "attack-db-access.ps1";
        Description = "Intenta acceso no autorizado a MongoDB"
    },
    @{
        Name = "Brute Force Attack";
        File = "attack-brute-force.ps1";
        Description = "Simula multiples intentos de login fallidos"
    }
)

Write-Host "Ataques disponibles:" -ForegroundColor Cyan
Write-Host ""
for ($i = 0; $i -lt $attackScripts.Count; $i++) {
    $num = $i + 1
    Write-Host "[$num] $($attackScripts[$i].Name)" -ForegroundColor Yellow
    Write-Host "    $($attackScripts[$i].Description)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "====================================================" -ForegroundColor Cyan

$response = Read-Host "Selecciona un numero (1-$($attackScripts.Count)) o presiona Enter para ejecutar todos"

$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$attacksToRun = @()

if ([string]::IsNullOrEmpty($response) -or $response -eq "") {
    $attacksToRun = $attackScripts
    Write-Host ""
    Write-Host "Ejecutando TODOS los ataques simulados..." -ForegroundColor Red
} elseif ($response -ge 1 -and $response -le $attackScripts.Count) {
    $selectedIndex = [int]$response - 1
    $attacksToRun = @($attackScripts[$selectedIndex])
    Write-Host ""
    Write-Host "Ejecutando: $($attackScripts[$selectedIndex].Name)" -ForegroundColor Red
} else {
    Write-Host "Opcion invalida" -ForegroundColor Red
    exit 1
}

$executedCount = 0
$completedCount = 0

foreach ($attack in $attacksToRun) {
    $scriptPath = Join-Path $currentDir $attack.File
    
    if (Test-Path $scriptPath) {
        Write-Host ""
        Write-Host ""
        Write-Host "====================================================" -ForegroundColor Red
        Write-Host "[$($executedCount + 1)/$($attacksToRun.Count)] Iniciando: $($attack.Name)" -ForegroundColor Red
        Write-Host "====================================================" -ForegroundColor Red
        Write-Host ""
        
        # Pasar parametros segun el tipo de script
        if ($attack.Name -eq "Brute Force Attack") {
            & $scriptPath -MongoExpressUrl $MongoExpressUrl
        } else {
            & $scriptPath -BaseUrl $BaseUrl
        }
        
        if ($LASTEXITCODE -eq 0) {
            $completedCount++
        }
        
        $executedCount++
        
        if ($executedCount -lt $attacksToRun.Count) {
            Write-Host ""
            Write-Host "Presiona cualquier tecla para continuar con el siguiente ataque..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    } else {
        Write-Host "ERROR: No se encontro $($attack.File)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "          RESUMEN DE SIMULACION DE ATAQUES" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Ataques ejecutados: $executedCount" -ForegroundColor Cyan
Write-Host "Ataques mitigados exitosamente: $completedCount" -ForegroundColor Green
Write-Host ""

if ($completedCount -eq $executedCount -and $executedCount -gt 0) {
    Write-Host "RESULTADO: TODAS LAS DEFENSAS FUNCIONARON CORRECTAMENTE" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sistemas de seguridad activos:" -ForegroundColor Green
    Write-Host "  - ModSecurity WAF (OWASP CRS)" -ForegroundColor Green
    Write-Host "  - Fail2ban (Rate limiting)" -ForegroundColor Green
    Write-Host "  - iptables (Firewall)" -ForegroundColor Green
    Write-Host "  - Aislamiento de redes Docker" -ForegroundColor Green
    Write-Host "  - Autenticacion y Control de Acceso" -ForegroundColor Green
} else {
    Write-Host "VERIFICAR: Algunos ataques no fueron completados correctamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
