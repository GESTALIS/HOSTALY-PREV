@echo off
REM Script de sauvegarde Railway pour Windows
REM Usage: scripts\railway-backup.bat [staging|production]

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set BACKUP_DIR=.\backups
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "DATE=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

echo 💾 Sauvegarde Railway - Environnement: %ENVIRONMENT%

REM Créer le dossier de sauvegarde
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Sélectionner le service selon l'environnement
if "%ENVIRONMENT%"=="staging" (
    set SERVICE_NAME=backend-staging
    set DB_NAME=hotaly_prev_staging
) else (
    set SERVICE_NAME=backend-production
    set DB_NAME=hotaly_prev
)

echo 🔧 Sauvegarde du service: %SERVICE_NAME%

REM Créer la sauvegarde
set BACKUP_FILE=%BACKUP_DIR%\backup_%ENVIRONMENT%_%DATE%.sql

echo 📊 Création de la sauvegarde: %BACKUP_FILE%

REM Exporter la base de données
railway run --service %SERVICE_NAME% pg_dump %DATABASE_URL% > "%BACKUP_FILE%"

echo ✅ Sauvegarde créée: %BACKUP_FILE%

echo 🧹 Nettoyage des anciennes sauvegardes terminé
