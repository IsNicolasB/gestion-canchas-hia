# Script de Configuración de Firewall para Docker en Windows

## Descripción
Este script configura automáticamente las reglas del Firewall de Windows para proteger los servicios de tu aplicación Docker. Específicamente:

- **MongoDB (puerto 27017)**: Bloquea todo el tráfico externo, permitiendo solo conexiones desde la red interna de Docker.
- **Redis (puerto 6379)**: Bloquea todo el tráfico externo, permitiendo solo conexiones desde localhost (127.0.0.1).
- **Backend (puerto 3000)**: Bloquea todo el tráfico externo, permitiendo solo conexiones desde localhost (127.0.0.1).

## Cómo usar el script

### Ejecutar el script como administrador
```powershell
Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-File `"D:\Vscode\TPFinal-HIA2025\gestion-canchas-hia\security\firewall\setup_docker_firewall.ps1`""
```

### Verificar la conectividad a los puertos

#### Para Redis (puerto 6379):
```powershell
# Reemplaza 192.168.1.6 con tu dirección IP local
Test-NetConnection -ComputerName 192.168.1.6 -Port 6379
```

#### Para el Backend (puerto 3000):
```powershell
# Reemplaza 192.168.1.6 con tu dirección IP local
Test-NetConnection -ComputerName 192.168.1.6 -Port 3000
```

## Interpretación de resultados

### En el script:
- Si ves mensajes de error al crear reglas, verifica que Docker esté en ejecución.
- Las reglas se crean con nombres que empiezan con "Bloquear" o "Permitir".

### En las pruebas de conexión:
- **PingSucceeded: True**: Significa que el equipo es alcanzable en la red.
- **TcpTestSucceeded: True**: Significa que el puerto está abierto y aceptando conexiones.
- **TcpTestSucceeded: False**: Significa que el puerto está bloqueado o el servicio no está escuchando en ese puerto.

## Verificación de reglas
Para ver todas las reglas de firewall configuradas:
```powershell
Get-NetFirewallRule -DisplayName "Bloquear *","Permitir *" | 
    Format-Table DisplayName, Enabled, Direction, Action, @{Name="LocalPort";Expression={$_.LocalPort -join ","}} -AutoSize
```

## Notas importantes
- El script debe ejecutarse con privilegios de administrador.
- Las reglas se aplican al reiniciar el equipo o el servicio de Firewall de Windows.
- Para eliminar todas las reglas creadas, usa:
  ```powershell
  Get-NetFirewallRule -DisplayName "Bloquear *","Permitir *" | Remove-NetFirewallRule
  ```
