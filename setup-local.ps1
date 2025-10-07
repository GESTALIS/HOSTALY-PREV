# HOSTALY PREV - Setup environnement de développement local
# À exécuter sur votre machine de développement

Write-Host "🛠️  HOSTALY PREV - Setup environnement local" -ForegroundColor Green
Write-Host ""

# 1. Créer les fichiers .env pour le développement local
Write-Host "📝 Création des fichiers .env..." -ForegroundColor Yellow

# Backend .env.local
$backendEnv = @"
DATABASE_URL=postgresql://hostaly:Ees230304%40@192.168.1.250:5432/hostaly?schema=public
JWT_SECRET=your-jwt-secret-here-replace-with-actual-guid
CORS_ORIGIN=http://localhost:5173
PORT=3003
"@

$backendEnv | Out-File -FilePath "backend\.env.local" -Encoding UTF8
Write-Host "✅ backend\.env.local créé" -ForegroundColor Green

# Frontend .env.local
$frontendEnv = @"
VITE_API_BASE=http://192.168.1.250:8080/api/v1
"@

$frontendEnv | Out-File -FilePath "frontend\.env.local" -Encoding UTF8
Write-Host "✅ frontend\.env.local créé" -ForegroundColor Green

# 2. Installer les dépendances
Write-Host ""
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow

# Backend
Write-Host "Backend..." -ForegroundColor Cyan
Set-Location backend
npm install
npx prisma generate
Set-Location ..

# Frontend
Write-Host "Frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host "✅ Dépendances installées" -ForegroundColor Green

# 3. Scripts de développement
Write-Host ""
Write-Host "🚀 Scripts de développement disponibles:" -ForegroundColor Yellow
Write-Host "  npm run dev:local    - Développement complet (backend + frontend)" -ForegroundColor Cyan
Write-Host "  npm run dev:backend  - Backend seul" -ForegroundColor Cyan
Write-Host "  npm run dev:frontend - Frontend seul" -ForegroundColor Cyan
Write-Host "  npm run deploy       - Déploiement sur serveur" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎉 Setup terminé!" -ForegroundColor Green
Write-Host "💡 Pour commencer: npm run dev:local" -ForegroundColor Yellow

