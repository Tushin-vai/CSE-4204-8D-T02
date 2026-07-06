// config/db.js — PostgreSQL connection pool (works with Supabase)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Supabase gives you this URL
  ssl: { rejectUnauthorized: false },           // Required for Supabase
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Simple query helper
const query = (text, params) => pool.query(text, params);

// Transaction helper — wraps multiple queries so they all succeed or all fail
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, withTransaction };
