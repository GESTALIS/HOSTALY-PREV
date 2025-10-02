#!/bin/sh

# Script de démarrage pour Render avec debugging
echo "=== [HOTALY-PREV] Démarrage du serveur ==="
echo "[INFO] Working directory: $(pwd)"
echo "[INFO] Files in dist/: $(ls -la dist/ 2>/dev/null || echo 'dist/ not found')"
echo "[INFO] Node version: $(node --version)"

# Générer le client Prisma (préparatif future)
echo "[PRISMA] Génération du client..."
npx prisma generate || echo "[PRISMA] ⚠️ Generate failed - continuing anyway"

# Appliquer les migrations (préparatif future)  
echo "[PRISMA] Application des migrations..."
npx prisma migrate deploy || echo "[PRISMA] ⚠️ Migrate failed - continuing anyway"

# SERVEUR COMPLET AVEC ROUTES RH ET PRISMA
echo "[FULL-SERVER] Démarrage du serveur complet HOTALY-PREV..."
npx tsc && node dist/server.js
