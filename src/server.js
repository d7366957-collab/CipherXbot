const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, pool } = require('./db');

// Importamos el bot para que se encienda junto con el servidor
require('./bot'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// --- RUTAS DE LA API ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CipherX API is running 🚀' });
});

app.get('/api/platform/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM platform_config WHERE id = 1');
    const config = result.rows[0];
    res.json({
      phase: config.phase,
      minWithdrawal: config.min_withdrawal,
      minDepositPhase2: config.min_deposit_phase2,
      freePoolStartedAt: config.free_pool_started_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// 1. RUTA PARA OBTENER DATOS DEL USUARIO
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    let result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    
    if (result.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (telegram_id, first_name) VALUES ($1, $2)',
        [telegramId, 'Trader']
      );
      result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// 2. RUTA PARA RECLAMAR EL BONO DE $40 (Usando las columnas de admin.js)
app.post('/api/user/claim-bonus', async (req, res) => {
  try {
    const { telegramId } = req.body;
    // Sumamos 40 al saldo congelado
    await pool.query(
      'UPDATE users SET frozen_balance = frozen_balance + 40.00 WHERE telegram_id = $1',
      [telegramId]
    );
    res.json({ ok: true, message: 'Bono reclamado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al reclamar bono' });
  }
});

// 3. RUTAS DE BILLETERA (Placeholders para que no dé error)
app.post('/api/wallet/withdraw', (req, res) => {
  res.json({ ok: true, message: 'Solicitud de retiro en proceso' });
});

app.post('/api/wallet/deposit', (req, res) => {
  res.json({ ok: true, message: 'Depósito registrado' });
});

// Manejo de rutas no encontradas
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta de API no encontrada' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor CipherX corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error fatal al arrancar el servidor:', error);
    process.exit(1);
  }
}

startServer();
