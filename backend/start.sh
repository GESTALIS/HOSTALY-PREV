#!/bin/sh

# Script de démarrage pour Render avec debugging
echo "=== [HOTALY-PREV] Démarrage du serveur ==="
echo "[INFO] Working directory: $(pwd)"
echo "[INFO] Files in dist/: $(ls -la dist/ 2>/dev/null || echo 'dist/ not found')"
echo "[INFO] Node version: $(node --version)"

# RETOUR AU SERVEUR COMPLET AVEC VRAIE LOGIQUE MÉTIER
echo "[FULL-SERVER] 🔄 Retour au serveur complet avec DB Prisma..."

# Régénérer client Prisma avec nouvelles colonnes
echo "[PRISMA] Régénération client..."
npx prisma generate --force

# Appliquer migrations
echo "[PRISMA] Migrations..."
npx prisma migrate deploy

# Compiler TypeScript
echo "[TYPESCRIPT] Compilation..."
npx tsc

# SERVEUR COMPLET - TOUTE VOTRE LOGIQUE MÉTIER
echo "[COMPLET-SERVER] 🚀 Démarrage avec vos vraies fonctionnalités..."
node dist/server.js
