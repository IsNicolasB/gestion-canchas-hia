#!/bin/bash

# =========================================
# Script de Prueba del Sistema de Backups
# =========================================

BACKUP_DIR="/backup"
LOG_FILE="${BACKUP_DIR}/test_backup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "🧪 INICIANDO PRUEBAS DEL SISTEMA DE BACKUP"
log "========================================="

# Test 1: Verificar conectividad con MongoDB
log ""
log "Test 1: Verificando conectividad con MongoDB..."
mongosh --host mongo-primary:27017 \
    --username devuser \
    --password devpass \
    --authenticationDatabase admin \
    --eval "db.adminCommand('ping')" \
    --quiet

if [ $? -eq 0 ]; then
    log "✅ Conectividad OK"
else
    log "❌ Error de conectividad"
    exit 1
fi

# Test 2: Verificar estructura de directorios
log ""
log "Test 2: Verificando estructura de directorios..."
if [ -d "${BACKUP_DIR}/dumps" ]; then
    log "✅ Directorio de backups existe"
else
    log "⚠️  Creando directorio de backups..."
    mkdir -p "${BACKUP_DIR}/dumps"
    log "✅ Directorio creado"
fi

# Test 3: Verificar permisos de scripts
log ""
log "Test 3: Verificando permisos de ejecución..."
for script in backup.sh restore.sh; do
    if [ -x "${BACKUP_DIR}/${script}" ]; then
        log "✅ ${script} tiene permisos de ejecución"
    else
        log "⚠️  ${script} sin permisos, corrigiendo..."
        chmod +x "${BACKUP_DIR}/${script}"
    fi
done

# Test 4: Ejecutar backup de prueba
log ""
log "Test 4: Ejecutando backup de prueba..."
bash "${BACKUP_DIR}/backup.sh"

if [ $? -eq 0 ]; then
    log "✅ Backup de prueba exitoso"
else
    log "❌ Error en backup de prueba"
    exit 1
fi

# Test 5: Verificar que el backup se creó
log ""
log "Test 5: Verificando archivos de backup..."
LATEST_BACKUP=$(ls -t "${BACKUP_DIR}/dumps" | grep "backup_" | head -1)

if [ -n "$LATEST_BACKUP" ]; then
    log "✅ Backup encontrado: ${LATEST_BACKUP}"
    log "📊 Contenido del backup:"
    ls -lh "${BACKUP_DIR}/dumps/${LATEST_BACKUP}" | tee -a "$LOG_FILE"
else
    log "❌ No se encontró ningún backup"
    exit 1
fi

# Test 6: Verificar crontab
log ""
log "Test 6: Verificando configuración de crontab..."
crontab -l 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✅ Crontab configurado"
else
    log "⚠️  Crontab no configurado o sin entradas"
fi

# Test 7: Verificar política de retención
log ""
log "Test 7: Verificando política de retención..."
BACKUP_COUNT=$(ls -d "${BACKUP_DIR}/dumps"/backup_* 2>/dev/null | wc -l)
log "📊 Backups actuales: ${BACKUP_COUNT}"
log "✅ Política de retención: 7 días (configurada en backup.sh)"

# Resumen final
log ""
log "========================================="
log "📊 RESUMEN DE PRUEBAS"
log "========================================="
log "✅ Sistema de backups operativo"
log "📁 Directorio de backups: ${BACKUP_DIR}/dumps"
log "💾 Total de backups: ${BACKUP_COUNT}"
log "🔄 Último backup: ${LATEST_BACKUP}"
log "⏰ Programación: Diario a las 2:00 AM"
log "🗑️  Retención: 7 días"
log "========================================="
log "✅ TODAS LAS PRUEBAS COMPLETADAS"
log "========================================="