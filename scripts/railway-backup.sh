#!/bin/bash

# Script de sauvegarde Railway
# Usage: ./scripts/railway-backup.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")

echo "💾 Sauvegarde Railway - Environnement: $ENVIRONMENT"

# Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

# Sélectionner le service selon l'environnement
if [ "$ENVIRONMENT" = "staging" ]; then
    SERVICE_NAME="backend-staging"
    DB_NAME="hotaly_prev_staging"
else
    SERVICE_NAME="backend-production"
    DB_NAME="hotaly_prev"
fi

echo "🔧 Sauvegarde du service: $SERVICE_NAME"

# Créer la sauvegarde
BACKUP_FILE="$BACKUP_DIR/backup_${ENVIRONMENT}_${DATE}.sql"

echo "📊 Création de la sauvegarde: $BACKUP_FILE"

# Exporter la base de données
railway run --service $SERVICE_NAME pg_dump $DATABASE_URL > $BACKUP_FILE

# Compresser la sauvegarde
gzip $BACKUP_FILE
BACKUP_FILE="$BACKUP_FILE.gz"

echo "✅ Sauvegarde créée: $BACKUP_FILE"

# Nettoyer les anciennes sauvegardes (garder 7 jours)
find $BACKUP_DIR -name "backup_${ENVIRONMENT}_*.sql.gz" -mtime +7 -delete

echo "🧹 Nettoyage des anciennes sauvegardes terminé"
