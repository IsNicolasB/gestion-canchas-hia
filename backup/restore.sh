#!/bin/bash

# =========================================
# Script de Restauración MongoDB
# =========================================

# Configuración
BACKUP_DIR="/backup/dumps"
MONGODB_HOST="mongo-primary:27017"
MONGODB_USER="devuser"
MONGODB_PASSWORD="devpass"
MONGODB_AUTH_DB="admin"
LOG_FILE="/backup/restore.log"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar si se proporcionó un backup
if [ -z "$1" ]; then
    log "❌ Error: Debe especificar el nombre del backup a restaurar"
    log "📋 Backups disponibles:"
    ls -1 "${BACKUP_DIR}" | grep "backup_"
    log ""
    log "Uso: $0 <nombre_del_backup>"
    log "Ejemplo: $0 backup_20250101_020000"
    exit 1
fi

BACKUP_NAME="$1"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Verificar que el backup existe
if [ ! -d "$BACKUP_PATH" ]; then
    log "❌ Error: El backup '${BACKUP_NAME}' no existe"
    log "📋 Backups disponibles:"
    ls -1 "${BACKUP_DIR}" | grep "backup_"
    exit 1
fi

log "========================================="
log "🔄 Iniciando restauración desde: ${BACKUP_NAME}"
log "========================================="

# Mostrar información del backup
if [ -f "${BACKUP_PATH}/metadata.txt" ]; then
    log "📄 Información del backup:"
    cat "${BACKUP_PATH}/metadata.txt" | tee -a "$LOG_FILE"
    log ""
fi

# Confirmación (comentar para restauración automática)
log "⚠️  ADVERTENCIA: Esta operación sobrescribirá los datos actuales"
log "¿Desea continuar? (Este script requiere confirmación manual)"
log "Para restaurar automáticamente, ejecute: mongorestore --drop ..."

# Ejecutar mongorestore
log "📦 Ejecutando mongorestore..."
mongorestore \
    --host="${MONGODB_HOST}" \
    --username="${MONGODB_USER}" \
    --password="${MONGODB_PASSWORD}" \
    --authenticationDatabase="${MONGODB_AUTH_DB}" \
    --gzip \
    --drop \
    "${BACKUP_PATH}" \
    2>&1 | tee -a "$LOG_FILE"

# Verificar resultado
if [ $? -eq 0 ]; then
    log "✅ Restauración completada exitosamente"
    log "========================================="
else
    log "❌ Error durante la restauración"
    log "========================================="
    exit 1
fi