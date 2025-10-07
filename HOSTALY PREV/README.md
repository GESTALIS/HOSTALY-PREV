# 🏨 HOTALY PREV

**Plateforme de Planification Hôtelière Intelligente**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/votre-username/hotaly-prev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.0.0-blue.svg)](https://reactjs.org/)

## 🎯 **VISION**

HOTALY PREV est une plateforme moderne et intuitive de planification hôtelière qui permet aux gestionnaires d'optimiser leurs ressources, analyser leurs performances et planifier leur avenir avec précision.

## ✨ **FONCTIONNALITÉS**

### 🚀 **Phase 0 - SOCLE (Actuelle)**
- ✅ Architecture monorepo robuste
- ✅ Backend Node.js/Express/TypeScript
- ✅ Frontend React/Vite/TypeScript
- ✅ Base de données PostgreSQL avec Prisma
- ✅ Design system HOTALY moderne
- ✅ Navigation complète entre modules

### 📊 **Modules Disponibles**

| Module | Statut | Description |
|--------|--------|-------------|
| **🏠 Dashboard** | ✅ Actif | Vue d'ensemble et navigation |
| **👥 RH** | 🔄 En développement | Gestion des ressources humaines |
| **💰 CA** | 📋 À venir | Chiffre d'affaires & revenus |
| **⚡ Charges** | 📋 À venir | Gestion des coûts & dépenses |
| **📈 Résultats** | 📋 À venir | Analyse financière & performance |
| **📋 Scénarios** | 📋 À venir | Planification & simulations |
| **⚙️ Ratios** | 📋 À venir | Indicateurs de performance |

## 🛠️ **TECHNOLOGIES**

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Logging**: Pino

### **Frontend**
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Heroicons

### **Design System**
- **Palette**: Couleurs HOTALY personnalisées
- **Typography**: Plus Jakarta Sans + JetBrains Mono
- **Components**: Système de composants unifié
- **Responsive**: Mobile-first design

## 🚀 **INSTALLATION**

### **Prérequis**
- Node.js 18+ 
- PostgreSQL 12+
- Git

### **1. Cloner le repository**
```bash
git clone https://github.com/votre-username/hotaly-prev.git
cd hotaly-prev
```

### **2. Installer les dépendances**
```bash
# Installation racine
npm install

# Installation backend
cd backend
npm install

# Installation frontend
cd ../frontend
npm install
```

### **3. Configuration de la base de données**
```bash
# Retour à la racine
cd ..

# Démarrer PostgreSQL
npm run db

# Générer Prisma
npm run prisma:generate

# Migrations
npm run prisma:migrate

# Seed des données
npm run prisma:seed
```

### **4. Démarrer l'application**
```bash
# Terminal 1 - Backend
npm run api

# Terminal 2 - Frontend
npm run front
```

## 🌐 **ACCÈS**

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3002
- **Base de données**: localhost:5432

## 📁 **STRUCTURE DU PROJET**

```
hotaly-prev/
├── 📁 backend/                 # API Backend
│   ├── 📁 src/
│   │   ├── 📁 routes/         # Routes API
│   │   ├── 📁 middleware/     # Middleware Express
│   │   └── server.ts          # Serveur principal
│   ├── 📁 prisma/             # Schéma et migrations DB
│   └── package.json
├── 📁 frontend/                # Application React
│   ├── 📁 src/
│   │   ├── 📁 components/     # Composants UI
│   │   ├── 📁 pages/          # Pages de l'application
│   │   ├── 📁 state/          # Gestion d'état Zustand
│   │   └── 📁 styles/         # Styles et design system
│   └── package.json
├── 📁 docs/                    # Documentation
├── 📁 scripts/                 # Scripts utilitaires
└── package.json                 # Configuration monorepo
```

## 🎨 **DESIGN SYSTEM HOTALY**

### **Palette de Couleurs**
```css
--hotaly-primary: #004b5d      /* Bleu principal */
--hotaly-secondary: #f89032    /* Orange secondaire */
--hotaly-accent: #eca08e       /* Corail accent */
--hotaly-tertiary: #ba8a36     /* Or tertiaire */
--hotaly-neutral: #ededed      /* Gris neutre */
```

### **Typographie**
- **Titres**: Plus Jakarta Sans (700, 800)
- **Corps**: Plus Jakarta Sans (400, 500, 600)
- **Code**: JetBrains Mono (400, 500, 600)

## 🔧 **DÉVELOPPEMENT**

### **Scripts Disponibles**
```bash
# Démarrage complet
npm run setup          # Installation + configuration
npm run dev            # Démarrage frontend + backend

# Démarrage individuel
npm run api            # Backend uniquement
npm run front          # Frontend uniquement
npm run db             # Base de données

# Base de données
npm run prisma:generate    # Générer Prisma Client
npm run prisma:migrate     # Appliquer migrations
npm run prisma:seed        # Peupler la base
```

### **Variables d'Environnement**
```bash
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/hotaly_prev"
JWT_SECRET="votre-secret-jwt"
PORT=3002

# Frontend (.env)
VITE_API_URL="http://localhost:3002/api/v1"
```

## 📊 **ROADMAP**

### **Phase 1 - Modules Métier**
- [ ] **Module RH** - Finalisation complète
- [ ] **Module CA** - Gestion des revenus
- [ ] **Module Charges** - Gestion des coûts

### **Phase 2 - Intelligence**
- [ ] **Module Résultats** - Analyse avancée
- [ ] **Module Scénarios** - Simulations
- [ ] **Module Ratios** - KPIs

### **Phase 3 - Optimisation**
- [ ] **Performance** - Optimisations avancées
- [ ] **Tests** - Couverture complète
- [ ] **Deployment** - Production ready

## 🤝 **CONTRIBUTION**

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 **LICENCE**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 **CONTACT**

- **Développeur**: [Votre Nom]
- **Email**: [votre-email@example.com]
- **Projet**: [https://github.com/votre-username/hotaly-prev]

## 🙏 **REMERCIEMENTS**

- **React** - Framework frontend
- **Express** - Framework backend
- **Prisma** - ORM moderne
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides

---

**⭐ Si ce projet vous plaît, n'oubliez pas de le star sur GitHub !**
