// src/jobs.js
const cron = require('node-cron');
const { pool } = require('./db');
const { getRandomRate, generateDailyOperations } = require('./services/trading');
const { processPendingDeposits } = require('./services/deposit');
const { getPoolRemaining } = require('./services/pool');

// Cron Job 1: Rendimiento Diario (Medianoche UTC)
cron.schedule('0 0 * * *', async () => {
  console.log('⏳ Iniciando cálculo de rendimiento diario...');
  const client = await pool.connect();
  
  try {
    // Obtener todos los usuarios activos
    const usersRes = await client.query('SELECT * FROM users WHERE is_banned = FALSE');
    const users = usersRes.rows;

    const globalRate = getRandomRate(); // 0.6% a 0.9%
    console.log(`📈 Rendimiento global del día: ${(globalRate * 100).toFixed(2)}%`);

    for (const user of users) {
      const totalBalance = parseFloat(user.frozen_balance) + parseFloat(user.withdrawable_balance);
      if (totalBalance <= 0) continue;

      // Todo el rendimiento va al Retirable
      const dailyYield = totalBalance * globalRate;
      
      await client.query('BEGIN');
      
      // Sumar rendimiento al retirable
      await client.query(
        'UPDATE users SET withdrawable_balance = withdrawable_balance + $1 WHERE id = $2',
        [dailyYield, user.id]
      );

      // Generar e insertar las 6-7 operaciones ficticias
      const operations = generateDailyOperations(globalRate, totalBalance);
      for (const op of operations) {
        await client.query(
          'INSERT INTO daily_operations (user_id, pair, pnl_percentage, pnl_usdt, is_positive) VALUES ($1, $2, $3, $4, $5)',
          [user.id, op.pair, op.pnlPercentage, op.pnlUsdt, op.isPositive]
        );
      }

      await client.query('COMMIT');
    }
    console.log('✅ Rendimiento diario aplicado a todos los usuarios.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en rendimiento diario:', err);
  } finally {
    client.release();
  }
}, { timezone: 'UTC' });

// Cron Job 2: Verificar Depósitos Pendientes (Cada 2 minutos)
cron.schedule('*/2 * * * *', async () => {
  await processPendingDeposits();
});

// Cron Job 3: Actualizar Fase del Pool (Cada 5 minutos)
cron.schedule('*/5 * * * *', async () => {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM platform_config WHERE id = 1');
    const config = res.rows[0];
    
    const { remaining } = getPoolRemaining(config.free_pool_started_at);
    
    let newPhase = config.phase;
    if (remaining <= 0 && config.phase === 1) {
      newPhase = 2; // El pool se agotó, pasamos a Fase 2
      console.log('🚨 EL POOL DE 50K SE HA AGOTADO. PASANDO A FASE 2 (Solo inversores).');
    }

    if (newPhase !== config.phase) {
      await client.query('UPDATE platform_config SET phase = $1, updated_at = NOW() WHERE id = 1', [newPhase]);
    }
  } catch (err) {
    console.error('Error actualizando fase del pool:', err);
  } finally {
    client.release();
  }
});

console.log('⏰ Cron Jobs (Tareas automáticas) iniciados.');
