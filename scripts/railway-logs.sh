#!/bin/bash

# Script pour voir les logs Railway
# Usage: ./scripts/railway-logs.sh [service] [staging|production]

set -e

SERVICE=${1:-backend}
ENVIRONMENT=${2:-production}

echo "📋 Logs Railway - Service: $SERVICE, Environnement: $ENVIRONMENT"

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "Installer avec: npm install -g @railway/cli"
    exit 1
fi

# Construire le nom du service
if [ "$ENVIRONMENT" = "staging" ]; then
    SERVICE_NAME="$SERVICE-staging"
else
    SERVICE_NAME="$SERVICE-production"
fi

echo "🔍 Affichage des logs pour: $SERVICE_NAME"

# Afficher les logs en temps réel
railway logs --service $SERVICE_NAME --follow
