const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, pool } = require('./db');
// IMPORTANTE: Importamos el bot para que cargue las rutas de la API
const bot = require('./bot'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir la Mini App (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, '../public')));

// Si el bot tiene un router de express configurado, lo montamos aquí
// (Esto es por si las rutas están exportadas en bot.js)
if (bot && bot.router) {
  app.use('/api', bot.router);
}

// --- RUTAS DE LA API (Las que ya tenías) ---
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
    console.error('Error en /api/platform/status:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Manejo de rutas no encontradas para la API (evita que devuelva HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta de API no encontrada' });
});

// Cualquier otra ruta devuelve el index.html (Para que la Mini App no se rompa al recargar)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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
