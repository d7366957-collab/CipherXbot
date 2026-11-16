const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        first_name VARCHAR(255),
        photo_url TEXT,
        frozen_balance DECIMAL(18,2) DEFAULT 0,
        withdrawable_balance DECIMAL(18,2) DEFAULT 0,
        total_deposits DECIMAL(18,2) DEFAULT 0,
        bonus_claimed BOOLEAN DEFAULT FALSE,
        referred_by BIGINT,
        is_banned BOOLEAN DEFAULT FALSE,
        language VARCHAR(5) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
      CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

      CREATE TABLE IF NOT EXISTS platform_config (
        id SERIAL PRIMARY KEY,
        free_pool_total DECIMAL(18,2) DEFAULT 50000,
        free_pool_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        phase INT DEFAULT 1,
        min_withdrawal DECIMAL(18,2) DEFAULT 5,
        min_deposit_phase2 DECIMAL(18,2) DEFAULT 10,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO platform_config (id) VALUES (1) ON CONFLICT DO NOTHING;

      CREATE TABLE IF NOT EXISTS deposits (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        txid VARCHAR(255) UNIQUE NOT NULL,
        network VARCHAR(20) NOT NULL,
        amount DECIMAL(18,2),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_deposits_txid ON deposits(txid);
      CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);

      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        amount DECIMAL(18,2) NOT NULL,
        address TEXT NOT NULL,
        network VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INT REFERENCES users(id),
        referred_id INT REFERENCES users(id),
        commission_earned DECIMAL(18,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_operations (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        date DATE DEFAULT CURRENT_DATE,
        pair VARCHAR(20) NOT NULL,
        pnl_percentage DECIMAL(10,4) NOT NULL,
        pnl_usdt DECIMAL(18,2) NOT NULL,
        is_positive BOOLEAN
      );
      CREATE INDEX IF NOT EXISTS idx_operations_user_date ON daily_operations(user_id, date);
    `);
    console.log('✅ Base de datos inicializada correctamente.');
  } catch (err) {
    console.error('❌ Error inicializando DB:', err);
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
