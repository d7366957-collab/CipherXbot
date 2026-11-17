const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const { t } = require('./i18n');
const { pool } = require('./db');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Función auxiliar para enviar la bienvenida (evita repetir código)
async function sendWelcome(ctx, lang) {
  const message = t(lang, 'welcome');
  const webAppUrl = process.env.WEBAPP_URL || 'https://cipherrx.duckdns.org';
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.webApp(t(lang, 'btn_enter'), webAppUrl)],
    [Markup.button.callback(t(lang, 'btn_lang'), 'change_lang')]
  ]);

  const imagePath = path.join(__dirname, '../assets/icons/inicio.jpg');

  try {
    await ctx.replyWithPhoto(
      { source: imagePath }, 
      { caption: message, parse_mode: 'HTML', ...keyboard }
    );
  } catch (photoErr) {
    console.error('Error al enviar la foto, enviando solo texto:', photoErr.message);
    await ctx.reply(message, { parse_mode: 'HTML', ...keyboard });
  }
}

bot.start(async (ctx) => {
  const telegramId = ctx.from.id;
  const firstName = ctx.from.first_name || 'Trader';
  const username = ctx.from.username || '';

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    let userLang = 'en';

    if (userRes.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (telegram_id, username, first_name) VALUES ($1, $2, $3)',
        [telegramId, username, firstName]
      );
    } else {
      userLang = userRes.rows[0].language || 'en';
    }

    await sendWelcome(ctx, userLang);

  } catch (err) {
    console.error('Error en /start:', err);
    ctx.reply('Error al iniciar. Intenta de nuevo.');
  }
});

// CORREGIDO: Enviamos un mensaje NUEVO en lugar de intentar editar la foto
bot.action('change_lang', (ctx) => {
  ctx.reply(
    t('en', 'choose_lang'),
    Markup.inlineKeyboard([
      [Markup.button.callback('🇪🇸 Español', 'lang_es'), Markup.button.callback('🇬🇧 English', 'lang_en')],
      [Markup.button.callback('🇷🇺 Русский', 'lang_ru')]
    ])
  );
});

['es', 'en', 'ru'].forEach(lang => {
  bot.action(`lang_${lang}`, async (ctx) => {
    const telegramId = ctx.from.id;
    await pool.query('UPDATE users SET language = $1 WHERE telegram_id = $2', [lang, telegramId]);
    await ctx.answerCbQuery(t(lang, 'lang_selected'));
    
    // Enviamos la bienvenida de nuevo en el idioma elegido
    await sendWelcome(ctx, lang);
  });
});

bot.launch().then(() => {
  console.log('🤖 Bot de Telegram encendido y esperando mensajes...');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
