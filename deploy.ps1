# HOSTALY PREV - Script de déploiement automatique
# À exécuter sur le serveur SRV-7Y48-01 (PowerShell Admin)

param(
    [string]$Branch = "main",
    [switch]$SkipGit = $false,
    [switch]$SkipServices = $false
)

$ErrorActionPreference = "Stop"
$ProjectRoot = "C:\HOSTALY_PREV"
$BackendPath = "$ProjectRoot\backend"
$FrontendPath = "$ProjectRoot\frontend"

Write-Host "🚀 HOSTALY PREV - Déploiement automatique" -ForegroundColor Green
Write-Host "📁 Projet: $ProjectRoot" -ForegroundColor Cyan
Write-Host "🌿 Branche: $Branch" -ForegroundColor Cyan
Write-Host ""

# 1. Récupérer les derniers changements (si pas skip)
if (-not $SkipGit) {
    Write-Host "📥 Récupération des changements Git..." -ForegroundColor Yellow
    try {
        Set-Location $ProjectRoot
        git fetch origin
        git checkout $Branch
        git pull origin $Branch
        Write-Host "✅ Git OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur Git: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⏭️  Git ignoré (--SkipGit)" -ForegroundColor Yellow
}

# 2. Backend - Build
Write-Host ""
Write-Host "📦 Build Backend..." -ForegroundColor Yellow
try {
    Set-Location $BackendPath
    
    # Vérifier les dépendances
    if (-not (Test-Path "node_modules")) {
        Write-Host "📥 Installation des dépendances backend..." -ForegroundColor Yellow
        npm install
    }
    
    # Générer Prisma
    Write-Host "🗄️  Génération Prisma..." -ForegroundColor Yellow
    npx prisma generate
    
    # Build TypeScript
    Write-Host "🔨 Compilation TypeScript..." -ForegroundColor Yellow
    npm run build
    
    Write-Host "✅ Backend buildé avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur build backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Frontend - Build
Write-Host ""
Write-Host "🎨 Build Frontend..." -ForegroundColor Yellow
try {
    Set-Location $FrontendPath
    
    # Vérifier les dépendances
    if (-not (Test-Path "node_modules")) {
        Write-Host "📥 Installation des dépendances frontend..." -ForegroundColor Yellow
        npm install
    }
    
    # Build Vite
    Write-Host "🔨 Build Vite..." -ForegroundColor Yellow
    npm run build
    
    Write-Host "✅ Frontend buildé avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur build frontend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Redémarrage des services (si pas skip)
if (-not $SkipServices) {
    Write-Host ""
    Write-Host "🔄 Redémarrage des services..." -ForegroundColor Yellow
    
    try {
        # Arrêter le service API
        Write-Host "⏹️  Arrêt du service HOSTALY-API..." -ForegroundColor Yellow
        Stop-Service HOSTALY-API -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        # Redémarrer le service API
        Write-Host "▶️  Démarrage du service HOSTALY-API..." -ForegroundColor Yellow
        Start-Service HOSTALY-API
        Start-Sleep -Seconds 3
        
        Write-Host "✅ Services redémarrés" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur services: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "⚠️  Vérifiez manuellement les services Windows" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Services ignorés (--SkipServices)" -ForegroundColor Yellow
}

# 5. Tests de santé
Write-Host ""
Write-Host "🏥 Tests de santé..." -ForegroundColor Yellow

# Test API directe
try {
    $apiResponse = Invoke-WebRequest "http://127.0.0.1:3003/api/v1/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ API directe OK (port 3003): $($apiResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API directe KO: $($_.Exception.Message)" -ForegroundColor Red
}

# Test via Nginx
try {
    $nginxResponse = Invoke-WebRequest "http://localhost:8080/api/v1/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ API via Nginx OK (port 8080): $($nginxResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API via Nginx KO: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend
try {
    $frontendResponse = Invoke-WebRequest "http://localhost:8080" -UseBasicParsing -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend OK (port 8080): $($frontendResponse.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend KO: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Résumé
Write-Host ""
Write-Host "🎉 DÉPLOIEMENT TERMINÉ!" -ForegroundColor Green
Write-Host "🌐 Application: http://SRV-7Y48-01:8080" -ForegroundColor Cyan
Write-Host "🔧 API: http://localhost:8080/api/v1/health" -ForegroundColor Cyan
Write-Host ""

# 7. Logs récents (optionnel)
Write-Host "📋 Logs récents (dernières 5 lignes):" -ForegroundColor Yellow
try {
    if (Test-Path "$ProjectRoot\logs\backend_err.log") {
        Write-Host "Backend errors:" -ForegroundColor Red
        Get-Content "$ProjectRoot\logs\backend_err.log" -Tail 5
    }
    if (Test-Path "$ProjectRoot\logs\backend_out.log") {
        Write-Host "Backend output:" -ForegroundColor Green
        Get-Content "$ProjectRoot\logs\backend_out.log" -Tail 5
    }
} catch {
    Write-Host "⚠️  Impossible de lire les logs" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Prêt à l'utilisation!" -ForegroundColor Green

