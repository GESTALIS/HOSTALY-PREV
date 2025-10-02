require('dotenv/config');
const express = require('express');
const cors = require('cors');

const app = express();

// Configuration basique
app.use(cors());
app.use(express.json());

// Health check
app.get('/healthz', (req: any, res: any) => {
  res.status(200).send('ok');
});

// Routes RH basiques sans Prisma
app.get('/api/v1/rh/employees', (req: any, res: any) => {
  // Données factices - fonctionnel immédiatement
  res.json([
    {
      id: 1,
      firstName: "Jean",
      lastName: "Dupont", 
      fullName: "Jean Dupont",
      contractType: "CDI",
      weeklyHours: 35,
      isActive: true,
      mainServiceId: 1
    },
    {
      id: 2,
      firstName: "Marie",
      lastName: "Martin",
      fullName: "Marie Martin", 
      contractType: "CDI",
      weeklyHours: 32,
      isActive: true,
      mainServiceId: 2
    }
  ]);
});

app.get('/api/v1/services', (req: any, res: any) => {
  res.json([
    { id: 1, name: "Housekeeping", color: "#ff0000" },
    { id: 2, name: "Réception", color: "#0000ff" }
  ]);
});

// Données de test pour démo
app.post('/api/v1/rh/employees', (req: any, res: any) => {
  res.json({
    success: true,
    message: "Employé créé avec succès",
    id: Math.floor(Math.random() * 1000)
  });
});

const port = Number(process.env.PORT || 3002);

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Serveur HOTALY minimal démarré sur port ${port}`);
});

export {};
