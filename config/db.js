// config/db.js — PostgreSQL connection pool (works with Supabase)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Supabase gives you this URL
  ssl: { rejectUnauthorized: false },           // Required for Supabase
});

pool.on('error', (err) => {
  // A transient network blip or idle-client error shouldn't take the whole server down —
  // individual queries will fail/retry as normal. (Previously this called process.exit(-1),
  // which meant any brief DB hiccup killed the entire API.)
  console.error('Unexpected database pool error:', err.message);
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
