// Serveur ultra-simple pour tester Render
const express = require('express');
const app = express();

// Configuration basique
const PORT = process.env.PORT || 3000;

// Middleware JSON
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'HOTALY-PREV Backend OK!', timestamp: new Date().toISOString() });
});

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// API test
app.get('/test', (req, res) => {
  res.json({ message: 'API Test OK!', version: 'simple' });
});

// Démarrage
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [SIMPLE] Serveur démarré sur http://0.0.0.0:${PORT}`);
});
