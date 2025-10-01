#!/bin/bash

# Script de migration Railway
# Usage: ./scripts/railway-migrate.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}

echo "🗄️ Migration Railway - Environnement: $ENVIRONMENT"

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "Installer avec: npm install -g @railway/cli"
    exit 1
fi

# Sélectionner le service backend selon l'environnement
if [ "$ENVIRONMENT" = "staging" ]; then
    SERVICE_NAME="backend-staging"
else
    SERVICE_NAME="backend-production"
fi

echo "🔧 Migration sur le service: $SERVICE_NAME"

# Exécuter les migrations
echo "📊 Génération du client Prisma..."
railway run --service $SERVICE_NAME npx prisma generate

echo "🔄 Exécution des migrations..."
railway run --service $SERVICE_NAME npx prisma migrate deploy

echo "🌱 Seeding de la base de données (optionnel)..."
railway run --service $SERVICE_NAME npx prisma db seed || echo "⚠️ Seed non configuré ou échoué"

echo "✅ Migration terminée"
