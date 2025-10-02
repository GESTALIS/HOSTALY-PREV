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

# Vérifier dist/server.js existe
if [ -f "dist/server.js" ]; then
  echo "[SERVER] dist/server.js exists, starting..."
  node dist/server.js
else
  echo "[ERROR] dist/server.js not found!"
  echo "[INFO] Available files:"
  ls -la
  exit 1
fi
