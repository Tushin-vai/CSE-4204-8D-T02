// config/migrate.js — Run with: npm run migrate
// This reads schema.sql and runs it against your Supabase database
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Migration successful — all tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
