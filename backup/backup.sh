#!/bin/bash

# =========================================
# Script de Backup Automático MongoDB
# =========================================

# Configuración
BACKUP_DIR="/backup"
MONGODB_HOST="mongo-primary:27017"
MONGODB_USER="devuser"
MONGODB_PASSWORD="devpass"
MONGODB_AUTH_DB="admin"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${DATE}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Crear directorio de backups si no existe
mkdir -p "${BACKUP_DIR}/dumps"

log "========================================="
log "🔄 Iniciando backup: ${BACKUP_NAME}"
log "========================================="

# Ejecutar mongodump
log "📦 Ejecutando mongodump..."
mongodump \
    --host="${MONGODB_HOST}" \
    --username="${MONGODB_USER}" \
    --password="${MONGODB_PASSWORD}" \
    --authenticationDatabase="${MONGODB_AUTH_DB}" \
    --out="${BACKUP_DIR}/dumps/${BACKUP_NAME}" \
    --gzip \
    2>&1 | tee -a "$LOG_FILE"

# Verificar si el backup fue exitoso
if [ $? -eq 0 ]; then
    log "✅ Backup completado exitosamente: ${BACKUP_NAME}"
    
    # Crear archivo de metadatos
    cat > "${BACKUP_DIR}/dumps/${BACKUP_NAME}/metadata.txt" <<EOF
Fecha de creación: $(date)
Host: ${MONGODB_HOST}
Base de datos: Todas
Formato: Comprimido (gzip)
EOF
    
    # Calcular tamaño del backup
    BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/dumps/${BACKUP_NAME}" | cut -f1)
    log "📊 Tamaño del backup: ${BACKUP_SIZE}"
    
else
    log "❌ Error al crear el backup"
    exit 1
fi

# Política de retención: eliminar backups antiguos
log "🗑️  Aplicando política de retención (${RETENTION_DAYS} días)..."
find "${BACKUP_DIR}/dumps" -type d -name "backup_*" -mtime +${RETENTION_DAYS} -exec rm -rf {} \; 2>/dev/null

# Listar backups disponibles
log "📋 Backups disponibles:"
ls -lh "${BACKUP_DIR}/dumps" | grep "^d" | tee -a "$LOG_FILE"

# Contar backups
BACKUP_COUNT=$(ls -d "${BACKUP_DIR}/dumps"/backup_* 2>/dev/null | wc -l)
log "💾 Total de backups: ${BACKUP_COUNT}"

log "========================================="
log "✅ Proceso de backup finalizado"
log "========================================="
echo ""