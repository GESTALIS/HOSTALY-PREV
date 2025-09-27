#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🛑 Arrêt de tous les services HOTALY PREV...\n');

// Fonction pour arrêter les processus Node.js
function stopNodeProcesses() {
  return new Promise((resolve, reject) => {
    exec('taskkill /f /im node.exe', (error, stdout, stderr) => {
      if (error) {
        console.log('ℹ️  Aucun processus Node.js à arrêter');
      } else {
        console.log('✅ Processus Node.js arrêtés');
      }
      resolve();
    });
  });
}

// Fonction pour arrêter les processus sur les ports spécifiques
function stopPortProcesses() {
  const ports = [3002, 5174];
  
  return Promise.all(ports.map(port => {
    return new Promise((resolve) => {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.trim().split('\n');
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5) {
              const pid = parts[parts.length - 1];
              exec(`taskkill /f /pid ${pid}`, (killError) => {
                if (!killError) {
                  console.log(`✅ Processus sur le port ${port} arrêté (PID: ${pid})`);
                }
              });
            }
          });
        }
        resolve();
      });
    });
  }));
}

async function stopAllServices() {
  try {
    await stopPortProcesses();
    await stopNodeProcesses();
    console.log('\n🎉 Tous les services ont été arrêtés !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt des services:', error);
  }
}

stopAllServices();
