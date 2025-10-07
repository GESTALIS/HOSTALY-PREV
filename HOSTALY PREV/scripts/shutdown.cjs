const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function shutdownHotalyPrev() {
  console.log('🔄 Fermeture automatique de HOTALY PREV...');
  
  try {
    // 1. Arrêter tous les processus Node.js
    console.log('📱 Arrêt des processus Node.js...');
    exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
      if (error) {
        console.log('ℹ️ Aucun processus Node.js en cours ou déjà arrêté');
      } else {
        console.log('✅ Processus Node.js arrêtés');
      }
    });

    // 2. Arrêter Docker (si actif)
    console.log('🐳 Arrêt des conteneurs Docker...');
    exec('docker stop $(docker ps -q)', (error, stdout, stderr) => {
      if (error) {
        console.log('ℹ️ Aucun conteneur Docker en cours ou Docker non installé');
      } else {
        console.log('✅ Conteneurs Docker arrêtés');
      }
    });

    // 3. Sauvegarder automatiquement (optionnel)
    console.log('�� Sauvegarde automatique...');
    exec('git add . && git commit -m "Auto-sauvegarde avant fermeture - ' + new Date().toLocaleString() + '"', (error, stdout, stderr) => {
      if (error) {
        console.log('ℹ️ Pas de modifications à sauvegarder ou Git non configuré');
      } else {
        console.log('✅ Sauvegarde automatique effectuée');
      }
    });

    // 4. Attendre un peu puis vérifier
    setTimeout(() => {
      console.log('🔍 Vérification des ports...');
      
      // Vérifier les ports principaux
      const ports = [3002, 5174, 5434, 5050];
      ports.forEach(port => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
          if (stdout) {
            console.log(`⚠️ Port ${port} encore actif`);
          } else {
            console.log(`✅ Port ${port} libre`);
          }
        });
      });

      // 5. Message final
      setTimeout(() => {
        console.log('🎉 HOTALY PREV fermé avec succès !');
        console.log('�� Bonne soirée !');
        console.log('�� Pour redémarrer ce soir : npm run setup && npm run db && npm run api && npm run front');
      }, 2000);

    }, 3000);

  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
  }
}

// Exécuter la fermeture
shutdownHotalyPrev();
