#!/usr/bin/env node

import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 RÉPARATION DATABASE CORE POUR SERVEUR RÉEL...');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('✅ Connexion DB réussie');

  // 1. Créer les données de base manquantes si vide
  console.log('🔄 Vérification données de base...');
  
  const serviceCount = await client.query('SELECT COUNT(*) FROM "Service"');
  if (serviceCount.rows[0].count === '0') {
    console.log('📝 Création services de base...');
    await client.query(`
      INSERT INTO "Service" (name, type, color, "isActive", "createdAt", "updatedAt") 
      VALUES 
        ('Housekeeping', 'HOUSEKEEPING', '#ff0000', true, NOW(), NOW()),
        ('Réception', 'FRONT_DESK', '#0000ff', true, NOW(), NOW()),
        ('Room Service', 'ROOM_SERVICE', '#00ff00', true, NOW(), NOW())
    `);
  }

  const salaryGridCount = await client.query('SELECT COUNT(*) FROM "SalaryGrid"');
  if (salaryGridCount.rows[0].count === '0') {
    console.log('📝 Création grilles salariales...');
    await client.query(`
      INSERT INTO "SalaryGrid" (level, echelon, "hourlyRate", "createdAt", "updatedAt")
      VALUES 
        ('N1', '1', 12.5, NOW(), NOW()),
        ('N2', '2', 14.0, NOW(), NOW()),
        ('N3', '3', 16.5, NOW(), NOW())
    `);
  }

  console.log('✅ Données de base créées/réparées');

  await client.end();
  console.log('🎉 Database prête pour serveur réel !');

} catch (error) {
  console.error('❌ Erreur réparation:', error);
  process.exit(1);
}
