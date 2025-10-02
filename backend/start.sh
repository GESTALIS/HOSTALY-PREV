#!/bin/sh

# Script de démarrage pour Render avec debugging
echo "=== [HOTALY-PREV] Démarrage du serveur ==="
echo "[INFO] Working directory: $(pwd)"
echo "[INFO] Files in dist/: $(ls -la dist/ 2>/dev/null || echo 'dist/ not found')"
echo "[INFO] Node version: $(node --version)"

# STRATEGIE MINIMALISTE - Zéro complexité, ça marche !
echo "[MINIMAL] 🚀 Backend HOTALY minimal sans Prisma..."

# Compiler TypeScript seulement
echo "[TYPESCRIPT] Compilation..."
npx tsc || { echo "[TYPESCRIPT] ❌ Compilation failed"; exit 1; }

# SERVEUR MINIMALISTE - Données factices, fonctionnel immédiatement
echo "[MINIMAL-SERVER] Tourner le serveur minimal..."
node dist/server-minimal.js
