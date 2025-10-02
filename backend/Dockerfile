FROM node:18-alpine

WORKDIR /app

# Copier tous les fichiers
COPY . .

# Installer les dépendances
RUN npm ci

# Générer Prisma client
RUN npx prisma generate

# Build l'application
RUN npm run build

# Nettoyer les dev dependencies
RUN npm prune --production

# Exposer le port
EXPOSE 3002

# Commande de démarrage
CMD ["npm", "start"]
