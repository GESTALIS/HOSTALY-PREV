#!/bin/sh

# Script de démarrage pour Render avec migrations automatiques
echo "[HOTALY-PREV] Démarrage du serveur"

# Générer le client Prisma (toujours nécessaire)
echo "[PRISMA] Génération du client..."
npx prisma generate || { echo "❌ Échec génération Prisma"; exit 1; }

# Appliquer les migrations si nécessaire (idempotent)
echo "[PRISMA] Application des migrations..."
npx prisma migrate deploy || { echo "❌ Échec migrations Prisma"; exit 1; }

# Démarrer le serveur
echo "[SERVER] Démarrage du serveur Node.js..."
exec node dist/server.js
