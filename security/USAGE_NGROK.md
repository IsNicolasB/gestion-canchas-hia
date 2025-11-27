# Ejecutar Scripts de Seguridad con ngrok

Si tu compañero levanto el proyecto con ngrok, usa los siguientes comandos para ejecutar los tests de seguridad:

## URL de Ejemplo
```
https://jayme-subvesicular-paulene.ngrok-free.dev/
```

## Ejecutar Todos los Ataques

```powershell
cd D:\Vscode\TPFinal-HIA2025\gestion-canchas-hia\security\tests

# Con ngrok
.\run-attack-simulations.ps1 -BaseUrl "https://jayme-subvesicular-paulene.ngrok-free.dev" -MongoExpressUrl "https://jayme-subvesicular-paulene.ngrok-free.dev:8081"

# O con localhost (por defecto)
.\run-attack-simulations.ps1
```

## Ejecutar Ataques Individuales

### SQL Injection
```powershell
.\attack-sql-injection.ps1 -BaseUrl "https://jayme-subvesicular-paulene.ngrok-free.dev"
```

### XSS (Cross-Site Scripting)
```powershell
.\attack-xss.ps1 -BaseUrl "https://jayme-subvesicular-paulene.ngrok-free.dev"
```

### Command Injection
```powershell
.\attack-command-injection.ps1 -BaseUrl "https://jayme-subvesicular-paulene.ngrok-free.dev"
```

### Database Access Attack
```powershell
.\attack-db-access.ps1
```

### Brute Force Attack
```powershell
.\attack-brute-force.ps1 -MongoExpressUrl "https://jayme-subvesicular-paulene.ngrok-free.dev:8081"
```

## Todos los Tests de Seguridad

```powershell
.\run-all-tests.ps1
```

## Notas

- Reemplaza `https://jayme-subvesicular-paulene.ngrok-free.dev` con la URL real de tu ngrok
- Los parámetros `-BaseUrl` y `-MongoExpressUrl` son opcionales
- Si no especificas URLs, se usará `localhost:8080` por defecto
- Los scripts son totalmente compatibles con Windows PowerShell 5.1

## Parámetros Disponibles

| Script | Parámetro | Default | Descripción |
|--------|-----------|---------|-------------|
| attack-sql-injection.ps1 | -BaseUrl | http://localhost:8080 | URL del WAF para SQL Injection |
| attack-xss.ps1 | -BaseUrl | http://localhost:8080 | URL del WAF para XSS |
| attack-command-injection.ps1 | -BaseUrl | http://localhost:8080 | URL del WAF para Command Injection |
| attack-brute-force.ps1 | -MongoExpressUrl | http://localhost:8081 | URL de Mongo Express |
| run-attack-simulations.ps1 | -BaseUrl -MongoExpressUrl | localhost | URLs para ejecutar todos los ataques |
