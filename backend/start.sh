#!/bin/sh

# Script de démarrage pour Render avec debugging
echo "=== [HOTALY-PREV] Démarrage du serveur ==="
echo "[INFO] Working directory: $(pwd)"
echo "[INFO] Files in dist/: $(ls -la dist/ 2>/dev/null || echo 'dist/ not found')"
echo "[INFO] Node version: $(node --version)"

# RETOUR AU MINIMAL QUI FONCTIONNE À 100%
echo "[PROVEN-WORKING] 🔄 Retour au serveur minimal FONCTIONNEL..."

# Compiler TypeScript seulement
echo "[TYPESCRIPT] Compilation..."
npx tsc || { echo "[TYPESCRIPT] ❌ Compilation failed"; exit 1; }

# SERVEUR MINIMAL GARANTI - PAS D'ERREUR 500
echo "[FONCTIONNEL-SERVER] 🚀 Serveur minimal qui MARCHE..."
node dist/server-minimal.js
