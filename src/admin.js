// src/admin.js
const { pool } = require('./db');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => new Promise(resolve => rl.question(question, resolve));

async function main() {
  console.log('====================================');
  console.log('   🛡️  PANEL DE ADMINISTRACIÓN CIPHERX  🛡️');
  console.log('====================================');
  console.log('1. Ver retiros pendientes');
  console.log('2. Aprobar retiro (por ID)');
  console.log('3. Rechazar retiro (por ID)');
  console.log('4. Banear/Desbanear usuario');
  console.log('5. SORTEO: Acreditar saldo masivo');
  console.log('6. Salir');
  console.log('====================================');

  const option = await ask('Selecciona una opción (1-6): ');

  switch (option) {
    case '1':
      await viewPendingWithdrawals();
      break;
    case '2':
      await approveWithdrawal();
      break;
    case '3':
      await rejectWithdrawal();
      break;
    case '4':
      await toggleBanUser();
      break;
    case '5':
      await massAirdrop();
      break;
    case '6':
      console.log('Saliendo del panel...');
      rl.close();
      process.exit(0);
    default:
      console.log('Opción no válida.');
      main();
  }
}

// 1. Ver retiros pendientes
async function viewPendingWithdrawals() {
  const res = await pool.query(`
    SELECT w.id, w.amount, w.address, w.network, w.created_at, u.telegram_id, u.username, u.first_name 
    FROM withdrawals w 
    JOIN users u ON w.user_id = u.id 
    WHERE w.status = 'pending'
  `);

  if (res.rows.length === 0) {
    console.log('\nNo hay retiros pendientes.\n');
    return main();
  }

  console.log('\n--- RETIROS PENDIENTES ---');
  res.rows.forEach(w => {
    console.log(`ID: ${w.id} | Usuario: ${w.first_name} (@${w.username}) | Monto: ${w.amount} USDT | Red: ${w.network}`);
    console.log(`Dirección: ${w.address}`);
    console.log(`Fecha: ${w.created_at}\n`);
  });
  main();
}

// 2. Aprobar retiro
async function approveWithdrawal() {
  const id = await ask('ID del retiro a aprobar: ');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Aquí en el mundo real se envía la transacción desde tu wallet.
    // Por ahora, solo actualizamos el estado.
    const res = await client.query('UPDATE withdrawals SET status = $1 WHERE id = $2 RETURNING user_id, amount', ['completed', id]);
    
    if (res.rowCount > 0) {
      // Restar el saldo retirable al usuario
      await client.query('UPDATE users SET withdrawable_balance = withdrawable_balance - $1 WHERE id = $2', [res.rows[0].amount, res.rows[0].user_id]);
      await client.query('COMMIT');
      console.log(`✅ Retiro ${id} aprobado y saldo descontado.`);
      
      // Nota: Aquí llamarías a la función del bot para enviar un mensaje al usuario.
    } else {
      console.log('❌ Retiro no encontrado.');
    }
  } catch (e) {
    await client.query('ROLLBACK');
    console.log('Error:', e.message);
  } finally {
    client.release();
    main();
  }
}

// 3. Rechazar retiro
async function rejectWithdrawal() {
  const id = await ask('ID del retiro a rechazar: ');
  const res = await pool.query('UPDATE withdrawals SET status = $1 WHERE id = $2', ['rejected', id]);
  if (res.rowCount > 0) {
    console.log(`❌ Retiro ${id} rechazado.`);
  } else {
    console.log('No encontrado.');
  }
  main();
}

// 4. Banear/Desbanear
async function toggleBanUser() {
  const telegramId = await ask('ID de Telegram del usuario: ');
  const res = await pool.query('SELECT is_banned, first_name FROM users WHERE telegram_id = $1', [telegramId]);
  
  if (res.rows.length === 0) {
    console.log('Usuario no encontrado.');
    return main();
  }

  const newState = !res.rows[0].is_banned;
  await pool.query('UPDATE users SET is_banned = $1 WHERE telegram_id = $2', [newState, telegramId]);
  console.log(`Usuario ${res.rows[0].first_name} ahora está ${newState ? 'BANEADO 🚫' : 'ACTIVO ✅'}.`);
  main();
}

// 5. SORTEO / ACREDITACIÓN MASIVA (La función que pediste)
async function massAirdrop() {
  console.log('\n--- SORTEO MASIVO ---');
  console.log('1. Acreditar a TODOS los usuarios');
  console.log('2. Acreditar a usuarios aleatorios (sorteo)');
  console.log('3. Acreditar a un usuario específico');
  const subOpt = await ask('Selecciona opción (1-3): ');

  const amount = parseFloat(await ask('Monto en USDT a acreditar: '));
  if (isNaN(amount) || amount <= 0) return console.log('Monto inválido.'), main();

  const type = await ask('¿A qué saldo va? (1 = Retirable, 2 = Congelado): ');
  const targetColumn = type === '2' ? 'frozen_balance' : 'withdrawable_balance';

  try {
    if (subOpt === '1') {
      // A todos
      await pool.query(`UPDATE users SET ${targetColumn} = ${targetColumn} + $1 WHERE is_banned = FALSE`, [amount]);
      console.log(`✅ Acreditados ${amount} USDT a TODOS los usuarios activos en ${targetColumn}.`);

    } else if (subOpt === '2') {
      // A aleatorios
      const count = parseInt(await ask('¿A cuántos usuarios aleatorios?: '));
      const res = await pool.query('SELECT id, telegram_id, first_name FROM users WHERE is_banned = FALSE ORDER BY RANDOM() LIMIT $1', [count]);
      
      const ids = res.rows.map(r => r.id);
      if (ids.length > 0) {
        await pool.query(`UPDATE users SET ${targetColumn} = ${targetColumn} + $1 WHERE id = ANY($2)`, [amount, ids]);
        console.log(`🎉 Sorteo completado: ${ids.length} usuarios ganaron ${amount} USDT.`);
        
        // Aquí podrías iterar sobre res.rows para enviar mensajes personalizados por el bot.
        console.log('Ganadores:', res.rows.map(u => `${u.first_name} (${u.telegram_id})`).join(', '));
      }

    } else if (subOpt === '3') {
      // A uno específico
      const tgId = await ask('ID de Telegram del usuario: ');
      await pool.query(`UPDATE users SET ${targetColumn} = ${targetColumn} + $1 WHERE telegram_id = $2`, [amount, tgId]);
      console.log(`✅ Acreditados ${amount} USDT al usuario ${tgId}.`);
    }
  } catch (err) {
    console.log('Error en acreditación:', err.message);
  }
  main();
}

// Iniciar panel
main().catch(console.error);
