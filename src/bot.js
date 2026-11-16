const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const { t } = require('./i18n');
const { pool } = require('./db');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

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

    const message = t(userLang, 'welcome');
    const webAppUrl = process.env.WEBAPP_URL || 'https://cipherrx.duckdns.org';
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.webApp(t(userLang, 'btn_enter'), webAppUrl)],
      [Markup.button.callback(t(userLang, 'btn_lang'), 'change_lang')]
    ]);

    // Ruta local a la imagen en assets/icons/
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

  } catch (err) {
    console.error('Error en /start:', err);
    ctx.reply('Error al iniciar. Intenta de nuevo.');
  }
});

bot.action('change_lang', (ctx) => {
  ctx.editMessageText(
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
    ctx.deleteMessage();
    
    const imagePath = path.join(__dirname, '../assets/icons/inicio.jpg');
    const msg = t(lang, 'welcome');
    const kb = Markup.inlineKeyboard([
      [Markup.button.webApp(t(lang, 'btn_enter'), process.env.WEBAPP_URL)],
      [Markup.button.callback(t(lang, 'btn_lang'), 'change_lang')]
    ]);

    try {
      await ctx.replyWithPhoto({ source: imagePath }, { caption: msg, parse_mode: 'HTML', ...kb });
    } catch (e) {
      await ctx.reply(msg, { parse_mode: 'HTML', ...kb });
    }
  });
});

bot.launch().then(() => {
  console.log('🤖 Bot de Telegram encendido y esperando mensajes...');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
