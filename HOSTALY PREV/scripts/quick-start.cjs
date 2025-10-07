const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Démarrage rapide HOTALY PREV avec SQLite...');

// Copier le fichier .env pour utiliser SQLite
const envContent = `PORT=3002
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret-change-me
CORS_ORIGIN=http://localhost:5174
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100`;

fs.writeFileSync('./backend/.env', envContent);

console.log('✅ Configuration SQLite créée');

// Démarrer le backend
console.log('🔄 Démarrage du backend...');
exec('npm run api', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur backend:', error);
    return;
  }
  console.log('✅ Backend démarré:', stdout);
});

console.log('🌐 Frontend disponible sur: http://localhost:5174');
console.log('🔗 Backend disponible sur: http://localhost:3002');
