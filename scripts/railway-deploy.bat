@echo off
REM Script de déploiement Railway pour Windows
REM Usage: scripts\railway-deploy.bat [staging|production]

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo 🚂 Déploiement Railway - Environnement: %ENVIRONMENT%

REM Vérifier que Railway CLI est installé
railway --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI n'est pas installé
    echo Installer avec: npm install -g @railway/cli
    exit /b 1
)

REM Vérifier la connexion Railway
railway whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ Non connecté à Railway
    echo Se connecter avec: railway login
    exit /b 1
)

echo ✅ Railway CLI configuré

REM Sélectionner le projet selon l'environnement
if "%ENVIRONMENT%"=="staging" (
    echo 🔧 Configuration staging...
    set PROJECT_NAME=hotaly-staging
) else (
    echo 🔧 Configuration production...
    set PROJECT_NAME=hotaly-production
)

echo 📦 Déploiement du projet: %PROJECT_NAME%

REM Déployer
railway up --detach

echo ✅ Déploiement terminé
echo 🌐 Vérifiez les URLs dans le dashboard Railway
