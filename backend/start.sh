#!/bin/bash

# Script de démarrage pour Render avec migrations automatiques
echo "[START] Démarrage du serveur "

# Générer le client Prisma (toujours nécessaire)
echo "[PRISMA] Génération du client..."
npx prisma generate

# Appliquer les migrations si nécessaire (idempotent)
echo "[PRISMA] Application des migrations..."
npx prisma migrate deploy

# Démarrer le serveur
echo "[SERVER] Démarrage du serveur Node.js..."
node dist/server.js
