// src/services/trading.js

function getRandomRate() {
  // Retorna un número entre 0.006 (0.6%) y 0.009 (0.9%)
  const min = 0.006;
  const max = 0.009;
  return Math.random() * (max - min) + min;
}

function generateDailyOperations(totalRate, totalBalance) {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'TON/USDT'];
  const numOps = Math.floor(Math.random() * 2) + 6; // 6 o 7 operaciones
  
  // Seleccionar pares aleatorios sin repetir
  const selectedPairs = pairs.sort(() => 0.5 - Math.random()).slice(0, numOps);
  
  const operations = [];
  let currentRateSum = 0;

  for (let i = 0; i < numOps; i++) {
    const isPositive = i < numOps - 1 ? Math.random() < 0.85 : false; // 85% verdes, el último ajusta
    let pnlPercentage;

    if (i === numOps - 1) {
      // La última operación ajusta para que la suma sea exacta
      pnlPercentage = totalRate - currentRateSum;
    } else {
      // Operación normal (entre -0.3% y +0.5%)
      const randomPnl = Math.random() * (isPositive ? 0.5 : -0.3);
      pnlPercentage = isPositive ? Math.max(0.01, randomPnl) : Math.min(-0.01, randomPnl);
    }

    currentRateSum += pnlPercentage;
    const pnlUsdt = totalBalance * pnlPercentage;

    operations.push({
      pair: selectedPairs[i],
      pnlPercentage: parseFloat(pnlPercentage.toFixed(4)),
      pnlUsdt: parseFloat(pnlUsdt.toFixed(2)),
      isPositive: pnlPercentage >= 0
    });
  }

  // Ordenar aleatoriamente para que no salga siempre el negativo al final
  return operations.sort(() => Math.random() - 0.5);
}

module.exports = { getRandomRate, generateDailyOperations };
