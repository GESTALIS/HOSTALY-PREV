@echo off
REM Script pour voir les logs Railway pour Windows
REM Usage: scripts\railway-logs.bat [service] [staging|production]

set SERVICE=%1
if "%SERVICE%"=="" set SERVICE=backend

set ENVIRONMENT=%2
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo 📋 Logs Railway - Service: %SERVICE%, Environnement: %ENVIRONMENT%

REM Vérifier que Railway CLI est installé
railway --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI n'est pas installé
    echo Installer avec: npm install -g @railway/cli
    exit /b 1
)

REM Construire le nom du service
if "%ENVIRONMENT%"=="staging" (
    set SERVICE_NAME=%SERVICE%-staging
) else (
    set SERVICE_NAME=%SERVICE%-production
)

echo 🔍 Affichage des logs pour: %SERVICE_NAME%

REM Afficher les logs en temps réel
railway logs --service %SERVICE_NAME% --follow
