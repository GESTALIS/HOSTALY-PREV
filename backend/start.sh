#!/bin/sh

# Script de démarrage pour Render avec debugging
echo "=== [HOTALY-PREV] Démarrage du serveur ==="
echo "[INFO] Working directory: $(pwd)"
echo "[INFO] Files in dist/: $(ls -la dist/ 2>/dev/null || echo 'dist/ not found')"
echo "[INFO] Node version: $(node --version)"

# CRITIQUE: Régénérer le client Prisma pour correspondre aux nouvelles colonnes
echo "[PRISMA] 🔄 FORCE Génération du client Prisma..."
npx prisma generate --force || { echo "[PRISMA] ❌ Generate failed"; exit 1; }

# Appliquer les migrations (no-op si déjà appliquées)  
echo "[PRISMA] Application des migrations..."
npx prisma migrate deploy || echo "[PRISM] ⚠️ Migrate note needed"

# Compiler TypeScript
echo "[TYPESCRIPT] Compilation..."
npx tsc || { echo "[TYPESCRIPT] ❌ Compilation failed"; exit 1; }

# SERVEUR COMPLET AVEC ROUTES RH ET PRISMA
echo "[FULL-SERVER] 🚀 Démarrage du serveur complet HOTALY-PREV..."
node dist/server.js
