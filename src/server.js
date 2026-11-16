const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

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

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor CipherX corriendo en el puerto ${PORT}`);
      console.log(`🌐 Mini App disponible en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error fatal al arrancar el servidor:', error);
    process.exit(1);
  }
}

startServer();
