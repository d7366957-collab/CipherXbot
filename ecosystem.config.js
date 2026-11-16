module.exports = {
  apps: [
    {
      name: "cipherx-api",
      script: "./src/server.js",
      instances: 2, // Usa los 2 vCPU del VPS
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "cipherx-bot",
      script: "./src/bot.js",
      instances: 1, // El bot solo necesita 1 instancia para evitar doble respuesta
      env: {
        NODE_ENV: "production",
      }
    }
  ]
}
