FROM node:18-alpine

WORKDIR /app

# Installer OpenSSL et autres dépendances nécessaires
RUN apk add --no-cache openssl && \
    ln -s /usr/lib/libssl.so.3 /lib/libssl.so.1.1

# Copier tous les fichiers
COPY . .

# Installer les dépendances
RUN npm install

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
