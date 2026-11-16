// src/services/pool.js

// Puntos de la curva: [Porcentaje de tiempo, USDT consumidos]
const POOL_CURVE = [
  { t: 0.0,  c: 0 },      // Día 0: empieza en 50,000
  { t: 0.2,  c: 2000 },   // Día 1: se consumen 2,000
  { t: 0.4,  c: 7000 },   // Día 2: se consumen 5,000 más (total 7,000)
  { t: 0.6,  c: 17000 },  // Día 3: se consumen 10,000 más (total 17,000)
  { t: 0.8,  c: 32000 },  // Día 4: se consumen 15,000 más (total 32,000)
  { t: 1.0,  c: 50000 },  // Día 5: se consumen 18,000 más (total 50,000)
];

// Duración total: 5 días en milisegundos
const TOTAL_DURATION_MS = 5 * 24 * 60 * 60 * 1000;

function getPoolRemaining(startedAt) {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsed = now - start;

  // Si ya pasaron los 5 días, el pool está en 0 (Fase 2)
  if (elapsed >= TOTAL_DURATION_MS) {
    return { remaining: 0, progress: 1 };
  }

  const progress = elapsed / TOTAL_DURATION_MS; // 0 a 1

  // Calcular interpolación lineal entre los puntos de la curva
  let consumed = 0;
  for (let i = 0; i < POOL_CURVE.length - 1; i++) {
    const p1 = POOL_CURVE[i];
    const p2 = POOL_CURVE[i + 1];

    if (progress >= p1.t && progress <= p2.t) {
      const ratio = (progress - p1.t) / (p2.t - p1.t);
      consumed = p1.c + (p2.c - p1.c) * ratio;
      break;
    }
  }

  return {
    remaining: Math.max(0, 50000 - consumed),
    progress: progress
  };
}

module.exports = { getPoolRemaining };
