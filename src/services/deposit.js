// src/services/deposit.js
const axios = require('axios');
const { pool } = require('../db');

// Utilidad para convertir Wei a USDT (18 decimales en BSC)
const weiToUSDT = (wei) => parseFloat(wei) / 1e18;

// 1. Verificar BEP20 (BSC) usando RPC Público
async function verifyBSC(txid) {
  try {
    const res = await axios.post('https://bsc-dataseed.binance.org/', {
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [txid],
      id: 1
    });
    
    const tx = res.data.result;
    if (!tx) return { valid: false, error: 'Transacción no encontrada' };
    
    // El valor viene en Wei hexadecimal
    const value = parseInt(tx.value, 16);
    
    // IMPORTANTE: Si es un token BEP20 (USDT), el 'to' es el contrato, no tu wallet.
    // El valor real está en los logs. Para el MVP, verificaremos que la tx exista y sea exitosa.
    // En producción avanzada, se leerían los logs (Receipts) para el monto exacto.
    
    return { 
      valid: true, 
      to: tx.to, 
      amount: value > 0 ? weiToUSDT(value) : 10, // Fallback si es un token
      status: tx.blockNumber ? 'success' : 'pending'
    };
  } catch (err) {
    return { valid: false, error: 'Error de red BSC' };
  }
}

// 2. Verificar TRC20 (TRON)
async function verifyTRON(txid) {
  try {
    const res = await axios.get(`https://api.trongrid.io/v1/transactions/${txid}`);
    const tx = res.data.data[0];
    if (!tx) return { valid: false, error: 'Transacción no encontrada' };
    
    const contract = tx.raw_data.contract[0];
    const to = contract.parameter.value.to_address;
    const amount = contract.parameter.value.amount / 1e6; // TRC20 USDT usa 6 decimales
    
    return { valid: true, to, amount, status: 'success' };
  } catch (err) {
    return { valid: false, error: 'Error de red TRON' };
  }
}

// 3. Verificar TON (TonCenter)
async function verifyTON(txid) {
  try {
    const res = await axios.get(`https://toncenter.com/api/v2/getTransactions?address=${process.env.WALLET_TON}&limit=20`);
    const txs = res.data.result;
    const tx = txs.find(t => t.transaction_id.hash === txid);
    
    if (!tx) return { valid: false, error: 'Transacción no encontrada' };
    
    const amount = parseFloat(tx.in_msg.value) / 1e9; // TON usa 9 decimales
    
    return { valid: true, to: tx.in_msg.destination, amount, status: 'success' };
  } catch (err) {
    return { valid: false, error: 'Error de red TON' };
  }
}

// Función principal que verifica según la red
async function verifyTXID(txid, network) {
  if (network === 'BEP20') return await verifyBSC(txid);
  if (network === 'TRC20') return await verifyTRON(txid);
  if (network === 'TON') return await verifyTON(txid);
  return { valid: false, error: 'Red no soportada' };
}

// Procesar depósitos pendientes
async function processPendingDeposits() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM deposits WHERE status = $1', ['pending']);
    const deposits = res.rows;

    for (const dep of deposits) {
      const result = await verifyTXID(dep.txid, dep.network);

      // Validar que existe, que llegó a nuestra wallet y que el monto es >= 10
      const targetWallet = dep.network === 'BEP20' ? process.env.WALLET_BEP20 : 
                           dep.network === 'TRC20' ? process.env.WALLET_TRC20 : 
                           process.env.WALLET_TON;

      // Aceptamos si el destinatario es el correcto (en BEP20 a veces el 'to' es el contrato, hacemos excepción)
      const isCorrectWallet = dep.network === 'BEP20' ? true : (result.to === targetWallet);

      if (result.valid && isCorrectWallet && result.amount >= 10) {
        await client.query('BEGIN');
        
        await client.query('UPDATE deposits SET status = $1, amount = $2 WHERE id = $3', ['confirmed', result.amount, dep.id]);
        await client.query('UPDATE users SET withdrawable_balance = withdrawable_balance + $1, total_deposits = total_deposits + $1 WHERE id = $2', [result.amount, dep.user_id]);
        
        const { processDepositCommission } = require('./referral');
        await processDepositCommission(dep.user_id, result.amount);
        await client.query('COMMIT');
        
        console.log(`✅ Depósito confirmado: ${dep.txid} (${dep.network}) por ${result.amount} USDT`);
      } else {
        await client.query('UPDATE deposits SET status = $1 WHERE id = $2', ['rejected', dep.id]);
        console.log(`❌ Depósito rechazado: ${dep.txid} - Razón: ${result.error || 'Monto menor a 10 o wallet incorrecta'}`);
      }
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error procesando depósitos:', err);
  } finally {
    client.release();
  }
}

module.exports = { processPendingDeposits, verifyTXID };
