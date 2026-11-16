// src/services/referral.js
const { pool } = require('../db');

async function processReferral(newUserId, referrerTelegramId) {
  if (!referrerTelegramId) return;

  try {
    // Buscar al que invita
    const referrerRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [referrerTelegramId]);
    if (referrerRes.rows.length === 0) return;

    const referrerId = referrerRes.rows[0].id;

    // Actualizar al nuevo usuario con quién lo refirió
    await pool.query('UPDATE users SET referred_by = $1 WHERE id = $2', [referrerTelegramId, newUserId]);

    // Dar $1 al que invita
    await pool.query('UPDATE users SET frozen_balance = frozen_balance + 1 WHERE id = $1', [referrerId]);

    // Registrar en la tabla de referidos
    await pool.query(
      'INSERT INTO referrals (referrer_id, referred_id, commission_earned) VALUES ($1, $2, 1.00)',
      [referrerId, newUserId]
    );

    return true;
  } catch (err) {
    console.error('Error procesando referido:', err);
    return false;
  }
}

async function processDepositCommission(userId, depositAmount) {
  try {
    // Buscar quién lo refirió
    const userRes = await pool.query('SELECT referred_by FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || !userRes.rows[0].referred_by) return;

    const referrerTelegramId = userRes.rows[0].referred_by;
    const referrerRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [referrerTelegramId]);
    if (referrerRes.rows.length === 0) return;

    const referrerId = referrerRes.rows[0].id;
    const commission = depositAmount * 0.10; // 10%

    // Dar la comisión al retirable del que invita
    await pool.query('UPDATE users SET withdrawable_balance = withdrawable_balance + $1 WHERE id = $2', [commission, referrerId]);
    
    // Sumar a las comisiones ganadas
    await pool.query('UPDATE referrals SET commission_earned = commission_earned + $1 WHERE referrer_id = $2 AND referred_id = $3', [commission, referrerId, userId]);

  } catch (err) {
    console.error('Error procesando comisión:', err);
  }
}

module.exports = { processReferral, processDepositCommission };
