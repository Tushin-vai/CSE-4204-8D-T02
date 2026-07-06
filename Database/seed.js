// config/seed.js — Run with: npm run seed
// Creates one test user so you can test login immediately
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function seed() {
  try {
    const hash = await bcrypt.hash('Test@1234', 12);
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, is_verified, role)
       VALUES ($1, $2, $3, true, 'user')
       ON CONFLICT (email) DO NOTHING`,
      ['test@medinsight.dev', hash, 'Test User']
    );
    console.log('✅ Seed done — test@medinsight.dev / Test@1234');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
