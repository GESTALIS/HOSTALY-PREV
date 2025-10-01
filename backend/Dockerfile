FROM node:18-alpine

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances (inclure dev pour build)
RUN npm ci

# Copier le schéma Prisma d'abord
COPY prisma ./prisma

# Générer Prisma client
RUN npx prisma generate

# Copier le reste du code source
COPY . .

# Build l'application
RUN npm run build

# Nettoyer les dev dependencies
RUN npm prune --production

# Exposer le port
EXPOSE 3002

# Commande de démarrage
CMD ["npm", "start"]
