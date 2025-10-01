#!/bin/bash

# Script de déploiement Railway
# Usage: ./scripts/railway-deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}

echo "🚂 Déploiement Railway - Environnement: $ENVIRONMENT"

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "Installer avec: npm install -g @railway/cli"
    exit 1
fi

# Vérifier la connexion Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Non connecté à Railway"
    echo "Se connecter avec: railway login"
    exit 1
fi

echo "✅ Railway CLI configuré"

# Sélectionner le projet selon l'environnement
if [ "$ENVIRONMENT" = "staging" ]; then
    echo "🔧 Configuration staging..."
    # Ici vous pouvez ajouter la logique pour le projet staging
    PROJECT_NAME="hotaly-staging"
else
    echo "🔧 Configuration production..."
    PROJECT_NAME="hotaly-production"
fi

echo "📦 Déploiement du projet: $PROJECT_NAME"

# Déployer
railway up --detach

echo "✅ Déploiement terminé"
echo "🌐 Vérifiez les URLs dans le dashboard Railway"
