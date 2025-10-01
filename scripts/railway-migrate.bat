@echo off
REM Script de migration Railway pour Windows
REM Usage: scripts\railway-migrate.bat [staging|production]

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo 🗄️ Migration Railway - Environnement: %ENVIRONMENT%

REM Vérifier que Railway CLI est installé
railway --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI n'est pas installé
    echo Installer avec: npm install -g @railway/cli
    exit /b 1
)

REM Sélectionner le service backend selon l'environnement
if "%ENVIRONMENT%"=="staging" (
    set SERVICE_NAME=backend-staging
) else (
    set SERVICE_NAME=backend-production
)

echo 🔧 Migration sur le service: %SERVICE_NAME%

REM Exécuter les migrations
echo 📊 Génération du client Prisma...
railway run --service %SERVICE_NAME% npx prisma generate

echo 🔄 Exécution des migrations...
railway run --service %SERVICE_NAME% npx prisma migrate deploy

echo 🌱 Seeding de la base de données (optionnel)...
railway run --service %SERVICE_NAME% npx prisma db seed
if errorlevel 1 echo ⚠️ Seed non configuré ou échoué

echo ✅ Migration terminée
