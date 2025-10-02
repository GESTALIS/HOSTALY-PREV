#!/bin/sh

# Script de démarrage pour Render avec debugging
echo "=== [HOTALY-PREV] Démarrage du serveur ==="
echo "[INFO] Working directory: $(pwd)"
echo "[INFO] Files in dist/: $(ls -la dist/ 2>/dev/null || echo 'dist/ not found')"
echo "[INFO] Node version: $(node --version)"

# Générer le client Prisma
echo "[PRISMA] Génération du client..."
npx prisma generate

# Appliquer les migrations
echo "[PRISMA] Application des migrations..."
npx prisma migrate deploy

# TEST ULTRA-SIMPLE - Pas de Prisma pour l'instant
echo "[SIMPLE] Test avec serveur JavaScript simple..."
node src/server-simple.js
