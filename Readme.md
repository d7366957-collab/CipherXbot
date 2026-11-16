# CipherX - Copy-Trading Mini App 🚀

CipherX es una plataforma de Copy-Trading integrada en Telegram mediante una Mini App. Diseñada para ser rápida, segura y con una interfaz de usuario premium.

## 🛠️ Tecnologías
- **Backend:** Node.js, Express, Telegraf (Bot API)
- **Base de Datos:** PostgreSQL
- **Frontend:** HTML, CSS (Vanilla), JavaScript (Telegram WebApp API)
- **Infraestructura:** VPS Ubuntu, PM2, Nginx.

## 🚀 Instalación en Local/VPS
1. Clonar el repositorio.
2. Renombrar `.env.example` a `.env` y llenar las credenciales.
3. Instalar dependencias: `npm install`
4. Crear la base de datos en PostgreSQL.
5. Iniciar en producción: `pm2 start ecosystem.config.js`
