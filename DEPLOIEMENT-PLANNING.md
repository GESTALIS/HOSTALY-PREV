# 🚀 DÉPLOIEMENT - SYSTÈME DE PLANNING COMPLET

## ✅ CE QUI A ÉTÉ DÉVELOPPÉ

### 🎨 FRONTEND
- **PlanningManager** : 3 modes (Recommandations IA / Manuel / Congés Payés)
- **PlanningHebdomadaire** : Planning semaine avec TRAVAIL/REPOS/CONGÉ
- **GestionConges** : Suivi des 30 jours de CP par employé
- **AlertesConformite** : Alertes légales (heures + congés)

### 🔧 BACKEND
- **API Planning** : `/api/v1/planning/*` (recommandations, analyse)
- **API Congés** : `/api/v1/leaves/*` (CRUD congés payés)
- **Modèle PaidLeave** : Gestion des congés dans PostgreSQL

---

## 📋 COMMANDES DE DÉPLOIEMENT

### Sur le serveur (SRV-7Y48-01) - PowerShell Admin :

```powershell
# 1. Aller à la racine du projet
cd "C:\HOSTALY_PREV"

# 2. Récupérer le nouveau code
git fetch origin
git pull origin main

# 3. Backend - Appliquer la migration Prisma
cd backend
npm install
npx prisma migrate dev --name add_paid_leave_model
npx prisma generate

# 4. Compiler le backend
npx tsc --noEmitOnError false

# 5. Frontend - Build
cd ../frontend
npm install
npm run build

# 6. Redémarrer le service API
Restart-Service HOSTALY-API

# 7. Tester
Start-Sleep -Seconds 5
Invoke-WebRequest "http://localhost:8080/api/v1/health" -UseBasicParsing
Invoke-WebRequest "http://localhost:8080/api/v1/leaves/all" -UseBasicParsing
```

---

## 🎯 FONCTIONNALITÉS DISPONIBLES

### Module RH → Section Planning :

#### 🤖 Mode Recommandations IA
- Suggestions d'optimisation
- Économies potentielles
- Bouton "Appliquer"

#### ✋ Mode Manuel
- **Planning Hebdomadaire** : Vue 7 jours
- **3 types de jours** :
  - 🟢 **TRAVAIL** : Shift avec heures (ex: 8h-17h30)
  - 🔵 **REPOS** : Jour de repos hebdomadaire
  - 🟠 **CONGÉ** : Congé payé
- **Suivi 35h** : Indicateurs visuels par employé
- **Navigation** : Semaine précédente/suivante
- **Saisonnalité** : Basse/Haute saison

#### 📅 Mode Congés Payés
- **Vue globale** : Tous les employés
- **Compteur** : X jours / 30 jours
- **Alertes légales** :
  - ✅ Conforme (≥20j pris)
  - ⚠️ Attention (<20j après juin)
  - ❌ Risque légal (<10j après septembre)
- **Ajouter/Supprimer** : Gestion des périodes de congés

#### 🚨 Alertes & Conformité (permanent)
- **Heures insuffisantes** : <35h/semaine
- **Heures supplémentaires** : >35h/semaine
- **Congés insuffisants** : <20j/an
- **Conformité** : Tout OK

---

## 🧪 TESTS À EFFECTUER

```powershell
# Test API Planning
Invoke-WebRequest "http://localhost:8080/api/v1/planning/recommendations" -UseBasicParsing

# Test API Congés
Invoke-WebRequest "http://localhost:8080/api/v1/leaves/all" -UseBasicParsing

# Test Frontend
# Ouvrir http://SRV-7Y48-01:8080
# Module RH → Planning
# Tester les 3 modes
```

---

## 📊 DONNÉES REQUISES

Pour que le système fonctionne, il faut :
1. **Employés** créés avec services et contrats
2. **Services** créés avec horaires d'ouverture
3. **Planning** : Ajouter des shifts manuellement
4. **Congés** : Enregistrer les périodes de CP

---

## ⚠️ NOTES IMPORTANTES

- **Migration Prisma** : Créera la table `PaidLeave` en base
- **Pas de données mockées** : Tout est basé sur les vraies données
- **Validation légale** : Respect des 30j CP et 35h/semaine
- **Saisonnalité** : Gestion Basse/Haute saison Guyane

---

## 🎯 PROCHAINES ÉTAPES (optionnel)

- Drag & Drop pour déplacer les shifts
- Export PDF du planning
- Notifications par email pour les alertes
- Historique des plannings
- Gestion des remplacements
