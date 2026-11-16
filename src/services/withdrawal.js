// src/services/withdrawal.js
const { pool } = require('../db');

async function canWithdraw(user, amount) {
  const configRes = await pool.query('SELECT * FROM platform_config WHERE id = 1');
  const config = configRes.rows[0];

  // 1. Validar mínimo (siempre $5)
  if (amount < config.min_withdrawal) {
    return { ok: false, reason: 'MIN_NOT_REACHED', message: `El monto mínimo de retiro es ${config.min_withdrawal} USDT.` };
  }

  // 2. Validar saldo suficiente
  if (amount > parseFloat(user.withdrawable_balance)) {
    return { ok: false, reason: 'INSUFFICIENT_BALANCE', message: 'Saldo retirable insuficiente.' };
  }

  // 3. Validar Fase 2 (requiere depósito mínimo)
  if (config.phase === 2 && parseFloat(user.total_deposits) < config.min_deposit_phase2) {
    return { 
      ok: false, 
      reason: 'INVESTORS_ONLY', 
      message: `🔥 El pool de 50,000 USDT se agotó. Retiros habilitados solo para inversores. Depósito mínimo: ${config.min_deposit_phase2} USDT.` 
    };
  }

  return { ok: true };
}

module.exports = { canWithdraw };
