# 🚂 Guide de Déploiement Railway

## 📋 Prérequis

1. **Compte Railway** : https://railway.app
2. **Compte GitHub** (pour connecter le repo)
3. **Projet sur GitHub** (votre repo HOTALY PREV)

## 🚀 Déploiement Étape par Étape

### Étape 1 : Préparation

1. **Pousser le code sur GitHub** :
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

### Étape 2 : Créer le Projet Railway

1. **Aller sur Railway** : https://railway.app
2. **Se connecter avec GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Sélectionner votre repo** : `HOTALY-PREV`

### Étape 3 : Configurer les Services

#### Service 1 : PostgreSQL Database
1. **Add Service** → **Database** → **PostgreSQL**
2. Railway crée automatiquement la base de données
3. **Noter les variables d'environnement** générées

#### Service 2 : Backend API
1. **Add Service** → **GitHub Repo**
2. **Sélectionner le dossier** : `backend`
3. Railway détecte automatiquement le Dockerfile

#### Service 3 : Frontend Web
1. **Add Service** → **GitHub Repo**
2. **Sélectionner le dossier** : `frontend`
3. Railway détecte automatiquement le Dockerfile

### Étape 4 : Variables d'Environnement

#### Backend Variables :
```
NODE_ENV=production
PORT=3002
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGIN=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
```

#### Frontend Variables :
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
```

### Étape 5 : Migration de la Base de Données

1. **Aller dans le service Backend**
2. **Ouvrir le terminal Railway**
3. **Exécuter les commandes** :
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Étape 6 : Vérification

1. **Backend Health Check** : `https://[backend-url].railway.app/api/v1/health`
2. **Frontend** : `https://[frontend-url].railway.app`
3. **Tester la connexion** entre frontend et backend

## 🔧 Configuration Avancée

### Environnement Staging (Optionnel)

1. **Dupliquer le projet** Railway
2. **Renommer** en "Hotaly Staging"
3. **Configurer les mêmes services**
4. **Variables d'environnement** avec URLs différentes

### Monitoring et Logs

- **Logs en temps réel** : Railway Dashboard → Logs
- **Métriques** : CPU, RAM, Réseau
- **Alertes automatiques** en cas de problème

## 💰 Coûts Estimés

- **Développement** : $5 gratuits/mois
- **Production** : ~$20/mois (DB + 2 services)
- **Staging** : +$10/mois

## 🔗 URLs Finales

- **Frontend** : `https://hotaly-frontend-production.railway.app`
- **Backend** : `https://hotaly-backend-production.railway.app`
- **Staging** : `https://hotaly-staging.railway.app`

## 🛠️ Workflow de Développement

### Développement Local
```bash
# Connecter votre backend local à Railway DB
# Modifier .env local :
DATABASE_URL="postgresql://postgres:password@[railway-db-url]:5432/railway"
```

### Déploiement Automatique
- **Push sur `main`** → Déploiement automatique
- **Push sur `staging`** → Déploiement staging

## 🚨 Dépannage

### Problèmes Courants

1. **Build échoue** :
   - Vérifier les logs Railway
   - Vérifier les variables d'environnement
   - Vérifier les Dockerfiles

2. **Base de données** :
   - Vérifier `DATABASE_URL`
   - Exécuter `npx prisma migrate deploy`

3. **Frontend ne se connecte pas** :
   - Vérifier `NEXT_PUBLIC_API_URL`
   - Vérifier les CORS settings

### Support
- **Documentation Railway** : https://docs.railway.app
- **Community Discord** : https://discord.gg/railway
- **GitHub Issues** : https://github.com/railwayapp/cli

## 📝 Notes Importantes

- **Ne jamais commiter** les fichiers `.env` avec les vrais secrets
- **Utiliser les variables Railway** pour les URLs dynamiques
- **Tester en staging** avant de déployer en production
- **Sauvegarder régulièrement** la base de données
