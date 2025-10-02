# 🚀 Guide de Déploiement Render

## Vue d'ensemble

Ce guide vous accompagne pour déployer HOTALY PREV sur Render avec 3 services séparés :
- **Base de données** : PostgreSQL
- **Backend** : API Express.js
- **Frontend** : Application React

## Prérequis

- ✅ Compte GitHub avec le repo `HOSTALY-PREV`
- ✅ Code pushé sur GitHub
- ✅ Compte Render (gratuit)

## Étape 1 : Créer le compte Render

### 1.1 Inscription
1. Aller sur [render.com](https://render.com)
2. Cliquer sur **"Get Started for Free"**
3. Choisir **"Sign up with GitHub"**
4. Autoriser l'accès à votre compte GitHub

### 1.2 Vérification
- Votre repo `HOSTALY-PREV` doit apparaître dans la liste
- Si ce n'est pas le cas, cliquer sur **"Connect GitHub"**

## Étape 2 : Créer la base de données PostgreSQL

### 2.1 Nouveau service
1. Dans le dashboard Render, cliquer sur **"New +"**
2. Sélectionner **"PostgreSQL"**

### 2.2 Configuration
```
Name: hotaly-db
Database: hotaly_prev
User: hotaly_user
Region: Oregon (US West)
Plan: Free
```

### 2.3 Récupérer les informations
1. Attendre que la base de données soit créée (2-3 minutes)
2. Aller dans l'onglet **"Info"**
3. Copier l'**"External Database URL"** (format : `postgresql://user:password@host:port/database`)

## Étape 3 : Créer le service Backend

### 3.1 Nouveau service
1. Cliquer sur **"New +"**
2. Sélectionner **"Web Service"**
3. Connecter le repo GitHub `HOSTALY-PREV`

### 3.2 Configuration Backend
```
Name: hotaly-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
Plan: Free
```

### 3.3 Variables d'environnement
Dans l'onglet **"Environment"**, ajouter :

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://[votre-url-de-la-base]
CORS_ORIGIN=https://hotaly-frontend.onrender.com
JWT_SECRET=votre-secret-jwt-super-securise
```

### 3.4 Déploiement
1. Cliquer sur **"Create Web Service"**
2. Attendre le déploiement (5-10 minutes)
3. Noter l'URL du service : `https://hotaly-backend.onrender.com`

## Étape 4 : Créer le service Frontend

### 4.1 Nouveau service
1. Cliquer sur **"New +"**
2. Sélectionner **"Web Service"**
3. Connecter le repo GitHub `HOSTALY-PREV`

### 4.2 Configuration Frontend
```
Name: hotaly-frontend
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npm start
Plan: Free
```

### 4.3 Variables d'environnement
Dans l'onglet **"Environment"**, ajouter :

```
NODE_ENV=production
VITE_API_URL=https://hotaly-backend.onrender.com
```

### 4.4 Déploiement
1. Cliquer sur **"Create Web Service"**
2. Attendre le déploiement (5-10 minutes)
3. Noter l'URL du service : `https://hotaly-frontend.onrender.com`

## Étape 5 : Migrations de base de données

### 5.1 Via Render Shell
1. Aller dans le service backend
2. Cliquer sur **"Shell"**
3. Exécuter les commandes :

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5.2 Via local (alternative)
```bash
cd backend
DATABASE_URL="votre-url-postgresql" npx prisma migrate deploy
DATABASE_URL="votre-url-postgresql" npx prisma generate
```

## Étape 6 : Test et vérification

### 6.1 Test de l'API
1. Ouvrir : `https://hotaly-backend.onrender.com/api/v1/health`
2. Vérifier la réponse : `{"status":"ok"}`

### 6.2 Test du frontend
1. Ouvrir : `https://hotaly-frontend.onrender.com`
2. Vérifier que l'application se charge
3. Tester la connexion à l'API

### 6.3 Test de la base de données
1. Aller dans le service backend
2. Onglet **"Logs"**
3. Vérifier qu'il n'y a pas d'erreurs de connexion

## Étape 7 : Configuration finale

### 7.1 Mise à jour des variables d'environnement
Une fois que vous avez les URLs finales, mettre à jour :

**Backend :**
```
CORS_ORIGIN=https://hotaly-frontend.onrender.com
```

**Frontend :**
```
VITE_API_URL=https://hotaly-backend.onrender.com
```

### 7.2 Redéploiement
- Les services se redéploient automatiquement après modification des variables
- Attendre 2-3 minutes

## Étape 8 : Monitoring et maintenance

### 8.1 Logs
- **Backend** : Onglet "Logs" dans le service backend
- **Frontend** : Onglet "Logs" dans le service frontend
- **Base de données** : Onglet "Logs" dans le service PostgreSQL

### 8.2 Métriques
- **Backend** : Onglet "Metrics" pour les performances
- **Frontend** : Onglet "Metrics" pour les performances

### 8.3 Alertes
- Configurer des alertes email en cas de problème
- Monitoring automatique de la disponibilité

## URLs finales

Une fois déployé, vous aurez :

- **Frontend** : `https://hotaly-frontend.onrender.com`
- **Backend API** : `https://hotaly-backend.onrender.com`
- **Health Check** : `https://hotaly-backend.onrender.com/api/v1/health`

## Dépannage

### Problème : Service ne démarre pas
1. Vérifier les logs dans l'onglet "Logs"
2. Vérifier les variables d'environnement
3. Vérifier que le build s'est bien passé

### Problème : Erreur de base de données
1. Vérifier l'URL de la base de données
2. Vérifier que les migrations ont été exécutées
3. Vérifier les logs du service backend

### Problème : CORS
1. Vérifier que `CORS_ORIGIN` pointe vers l'URL du frontend
2. Redéployer le backend après modification

### Problème : Frontend ne se connecte pas à l'API
1. Vérifier que `VITE_API_URL` pointe vers l'URL du backend
2. Vérifier les logs du frontend
3. Tester l'API directement

## Coûts

### Plan gratuit
- **Backend** : 750 heures/mois
- **Frontend** : 750 heures/mois
- **Base de données** : 1 Go de stockage
- **Limitation** : Services "sleep" après 15 min d'inactivité

### Plan payant (si nécessaire)
- **Starter** : $7/mois par service
- **Pas de limitation de sleep**
- **Plus de ressources**

## Support

- **Documentation Render** : [render.com/docs](https://render.com/docs)
- **Support** : Via le dashboard Render
- **Communauté** : [render.com/community](https://render.com/community)

---

## Résumé des étapes

1. ✅ Créer compte Render
2. ✅ Créer base de données PostgreSQL
3. ✅ Créer service backend
4. ✅ Créer service frontend
5. ✅ Exécuter migrations
6. ✅ Tester les services
7. ✅ Configurer les variables finales
8. ✅ Monitoring

**Temps total estimé : 30-45 minutes**
