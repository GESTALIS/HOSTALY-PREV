#!/bin/sh

# Script de démarrage pour Render avec debugging
echo "=== [HOTALY-PREV] Démarrage du serveur ==="
echo "[INFO] Working directory: $(pwd)"
echo "[INFO] Files in dist/: $(ls -la dist/ 2>/dev/null || echo 'dist/ not found')"
echo "[INFO] Node version: $(node --version)"

# ÉTAPE 1: RÉPARER LES DATA CORE FIRST
echo "[REPAIR-DATA] 🔧 Correction des données serveur complet..."

# Régénérer client Prisma avec nouvelles colonnes
echo "[PRISMA] Génération client..."
npx prisma generate --force

# Appliquer migrations manuelles PostgreSQL direct
echo "[PG-FIX] Correction directe DB..."
npm run pg-fix

# Compiler
echo "[TYPESCRIPT] Compilation..."
npx tsc

# SERVEUR COMPLET - VOS VRAIES FONCTIONNALITÉS RH
echo "[REAL-SERVER] 🚀 Démarrage avec vraies APIs RH..."
node dist/server.js
