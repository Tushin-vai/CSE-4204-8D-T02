// tests/checkDbConnectivity.js — Run with: npm run check-db
// Verifies your Supabase connection is working
require('dotenv').config();
const { pool } = require('../config/db');

async function checkDb() {
  try {
    // 1. Basic connection
    const res = await pool.query('SELECT NOW() AS time');
    console.log('✅ Connected to database. Server time:', res.rows[0].time);

    // 2. Check all required tables exist
    const tables = ['users', 'sessions', 'reports', 'summaries', 'chat_history'];
    for (const table of tables) {
      const check = await pool.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      );
      const exists = check.rows[0].exists;
      console.log(`${exists ? '✅' : '❌'} Table "${table}" ${exists ? 'exists' : 'MISSING — run npm run migrate'}`);
    }

    console.log('\n✅ Database check complete.');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   → Check your DATABASE_URL in .env');
  } finally {
    await pool.end();
  }
}

checkDb();
