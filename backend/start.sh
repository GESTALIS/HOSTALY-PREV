#!/bin/sh

# Script de démarrage pour Render avec debugging
echo "=== [HOTALY-PREV] Démarrage du serveur ==="
echo "[INFO] Working directory: $(pwd)"
echo "[INFO] Files in dist/: $(ls -la dist/ 2>/dev/null || echo 'dist/ not found')"
echo "[INFO] Node version: $(node --version)"

# SERVEUR POSTGRESQL RÉEL - CRUD complet avec mes endpoints
echo "[REAL-POSTGRESQL] 🔧 Installation schéma + démarrage PostgreSQL direct..."

# Compiler TypeScript
echo "[TYPESCRIPT] Compilation..."
npx tsc

# Initialiser les tables PostgreSQL minimales
echo "[DB-INIT] Initialisation schéma PostgreSQL..."
npm run db:init

# SERVEUR POSTGRESQL RÉEL - APIs CRUD fonctionnelles
echo "[POSTGRESQL-SERVER] 🚀 Serveur réel PostgreSQL avec mes endpoints..."
node dist/server.pg.js
