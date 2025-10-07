#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de HOTALY PREV...\n');

// Fonction pour démarrer un service
function startService(name, command, args, cwd) {
  console.log(`📦 Démarrage de ${name}...`);
  
  const process = spawn(command, args, {
    cwd: path.resolve(cwd),
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (error) => {
    console.error(`❌ Erreur lors du démarrage de ${name}:`, error.message);
  });

  process.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ ${name} s'est arrêté avec le code ${code}`);
    }
  });

  return process;
}

// Démarrer le backend
const backend = startService('Backend', 'npm', ['run', 'dev'], './backend');

// Attendre 3 secondes avant de démarrer le frontend
setTimeout(() => {
  const frontend = startService('Frontend', 'npm', ['run', 'dev'], './frontend');
}, 3000);

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt des services...');
  process.exit(0);
});

console.log('\n✅ Services démarrés !');
console.log('🌐 Frontend: http://localhost:5174');
console.log('🔧 Backend: http://localhost:3002');
console.log('\n💡 Appuyez sur Ctrl+C pour arrêter tous les services');
