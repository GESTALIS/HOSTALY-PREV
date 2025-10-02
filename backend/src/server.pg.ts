import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion PostgreSQL
const pgConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('onrender') || 
       process.env.DATABASE_URL?.includes('neon') ||
       process.env.DATABASE_URL?.includes('supabase') ?
       { rejectUnauthorized: false } : false
};

console.log('📍 Config PostgreSQL:', {
  host: pgConfig.connectionString?.split('@')[1]?.split(':')[0] || 'Unknown',
  ssl: !!pgConfig.ssl,
  url: process.env.DATABASE_URL ? '[PRESENT]' : '[MISSING]'
});

const pool = new Pool({
  ...pgConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Test de connexion PostgreSQL au démarrage
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err.message);
    console.error('❌ Error code:', err.code);
    return;
  }
  console.log('✅ PostgreSQL connecté:', client.database);
  release();
});

// Health check
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'HOTALY-PREV API' });
});

app.get('/healthz', (req, res) => {
  res.json({ ok: true });
});

// Debug endpoint pour test connexion PostgreSQL
app.get('/debug', async (req, res) => {
  try {
    const client = await pool.connect();
    console.log('🔍 Test connexion DB...');
    const result = await client.query('SELECT NOW() as timestamp, current_database() as db');
    client.release();
    
    res.json({
      success: true,
      timestamp: result.rows[0].timestamp,
      database: result.rows[0].db,
      message: 'Connexion PostgreSQL OK'
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// ENDPOINTS SERVICES EXACTS
app.get('/api/v1/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('⛔ GET /api/v1/services:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

app.post('/api/v1/services', async (req, res) => {
  try {
    const { code, name, active = true } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Missing code or name' });
    }
    const result = await pool.query(
      'INSERT INTO services (code, name, active) VALUES ($1, $2, $3) RETURNING *',
      [code, name, active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('⛔ POST /api/v1/services:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

app.put('/api/v1/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];
    const paramIndex = [];

    Object.entries(req.body).forEach(([key, value], idx) => {
      if (key === 'code' || key === 'name' || key === 'active') {
        updates.push(`${key} = $${idx + 2}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const query = `UPDATE services SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id, ...values]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('⛔ PUT /api/v1/services:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

app.delete('/api/v1/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM services WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.status(404).send();
  } catch (error) {
    console.error('⛔ DELETE /api/v1/services:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

// ENDPOINTS RH SERVICES (pour compatibilité frontend)
app.get('/api/v1/rh/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('⛔ GET /api/v1/rh/services:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

// ENDPOINTS SALARY GRIDS EXACTS
app.get('/api/v1/rh/salary-grid', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM salary_grids ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('⛔ GET /api/v1/rh/salary-grid:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

app.post('/api/v1/rh/salary-grid', async (req, res) => {
  try {
    const { label, base_salary, weekly_hours } = req.body;
    if (!label || !base_salary || !weekly_hours) {
      return res.status(400).json({ error: 'Missing label, base_salary or weekly_hours' });
    }
    const result = await pool.query(
      'INSERT INTO salary_grids (label, base_salary, weekly_hours) VALUES ($1, $2, $3) RETURNING *',
      [label, base_salary, weekly_hours]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('⛔ POST /api/v1/rh/salary-grid:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

// ENDPOINTS EMPLOYEES EXACTS
app.get('/api/v1/rh/employees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, s.name as service_name, sg.label as grid_label
      FROM employees e
      LEFT JOIN services s ON e.service_id = s.id
      LEFT JOIN salary_grids sg ON e.salary_grid_id = sg.id
      ORDER BY e.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('⛔ GET /api/v1/rh/employees:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

app.post('/api/v1/rh/employees', async (req, res) => {
  try {
    const { firstName, lastName, serviceId, salaryGridId, startDate = new Date().toISOString().split('T')[0], active = true } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Missing firstName or lastName' });
    }
    const result = await pool.query(
      'INSERT INTO employees (first_name, last_name, service_id, salary_grid_id, start_date, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [firstName, lastName, serviceId || null, salaryGridId || null, startDate, active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('⛔ POST /api/v1/rh/employees:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

app.put('/api/v1/rh/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, serviceId, salaryGridId, startDate, active } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      values.push(firstName);
      paramIndex++;
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      values.push(lastName);
      paramIndex++;
    }
    if (serviceId !== undefined) {
      updates.push(`service_id = $${paramIndex}`);
      values.push(serviceId);
      paramIndex++;
    }
    if (salaryGridId !== undefined) {
      updates.push(`salary_grid_id = $${paramIndex}`);
      values.push(salaryGridId);
      paramIndex++;
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramIndex}`);
      values.push(startDate);
      paramIndex++;
    }
    if (active !== undefined) {
      updates.push(`active = $${paramIndex}`);
      values.push(active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `UPDATE employees SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('⛔ PUT /api/v1/rh/employees:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

app.delete('/api/v1/rh/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('⛔ DELETE /api/v1/rh/employees:', error);
    res.status(500).json({ error: 'Database error', message: error });
  }
});

// Error handler global
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Erreur globale:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    code: err.code
  });
});

// Démarrage serveur avec gestion d'erreur
const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 HOTALY-PREV PostgreSQL API démarrée sur port ${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejetée:', reason);
});
