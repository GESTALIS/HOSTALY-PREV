#!/usr/bin/env ts-node

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  console.log('🔧 INITIALISATION DATABASE POSTGRESQL RÉELLE...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('ssl') || 
         process.env.DATABASE_URL?.includes('postgres') ?
         { rejectUnauthorized: false } : false
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion PostgreSQL réussie');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '..', 'db', 'repair.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('🔄 Exécution du schéma SQL...');
    await pool.query(sql);
    console.log('✅ Tables créées/vérifiées');

    // Tester les endpoints avec quelques données
    console.log('🎯 Test des données...');
    
    const servicesResult = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`📊 Services: ${servicesResult.rows[0].count}`);
    
    const gridsResult = await pool.query('SELECT COUNT(*) FROM salary_grids');
    console.log(`📊 Salary grids: ${gridsResult.rows[0].count}`);

    await pool.end();
    console.log('🎉 Database prête pour serveur réel !');

  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}
