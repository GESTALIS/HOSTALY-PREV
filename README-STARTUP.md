# 🚀 Guide de Démarrage HOTALY PREV

## Problème Récurrent : ERR_CONNECTION_REFUSED

Ce problème survient quand les services frontend et backend ne sont pas démarrés correctement.

## ✅ Solution Définitive

### 1. Commandes de Gestion des Services

```bash
# Démarrer tous les services (backend + frontend)
npm run start

# Arrêter tous les services
npm run stop

# Vérifier l'état des services
npm run status
```

### 2. Ports Utilisés

- **Frontend** : http://localhost:5174
- **Backend** : http://localhost:3002
- **Base de données** : PostgreSQL sur port 5434

### 3. Vérification Rapide

```bash
# Vérifier que les ports sont ouverts
netstat -ano | findstr :3002  # Backend
netstat -ano | findstr :5174  # Frontend
```

### 4. En Cas de Problème

1. **Arrêter tous les services** :
   ```bash
   npm run stop
   ```

2. **Redémarrer proprement** :
   ```bash
   npm run start
   ```

3. **Attendre 10-15 secondes** pour que les services démarrent complètement

4. **Ouvrir le navigateur** sur http://localhost:5174

## 🔧 Scripts Disponibles

- `npm run start` - Démarre tous les services
- `npm run stop` - Arrête tous les services  
- `npm run api` - Démarre seulement le backend
- `npm run front` - Démarre seulement le frontend
- `npm run db` - Démarre la base de données
- `npm run shutdown` - Arrêt complet

## ⚠️ Points Importants

1. **Toujours utiliser `npm run start`** au lieu de démarrer manuellement
2. **Attendre que les deux services soient démarrés** avant d'ouvrir le navigateur
3. **Utiliser `npm run stop`** avant de fermer le terminal
4. **Ne pas fermer le terminal** pendant que les services tournent

## 🎯 Workflow Recommandé

1. Ouvrir le terminal dans le dossier du projet
2. `npm run start`
3. Attendre 15 secondes
4. Ouvrir http://localhost:5174
5. Travailler sur l'application
6. `npm run stop` quand terminé
