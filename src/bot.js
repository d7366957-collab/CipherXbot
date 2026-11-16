const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const { t } = require('./i18n');
const { pool } = require('./db');

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
    const webAppUrl = process.env.WEBAPP_URL || 'https://cipherx.duckdns.org';
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.webApp(t(userLang, 'btn_enter'), webAppUrl)],
      [Markup.button.callback(t(userLang, 'btn_lang'), 'change_lang')]
    ]);

    // Nota: Cuando subas tu logo a un hosting, cambia esta URL
    await ctx.replyWithPhoto(
      { url: 'https://i.imgur.com/your_logo.png' }, 
      { caption: message, parse_mode: 'HTML', ...keyboard }
    );

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
    // Simulamos que el usuario vuelve a escribir /start
    ctx.reply(t(lang, 'welcome'), {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp(t(lang, 'btn_enter'), process.env.WEBAPP_URL)],
        [Markup.button.callback(t(lang, 'btn_lang'), 'change_lang')]
      ])
    });
  });
});

bot.launch().then(() => {
  console.log('🤖 Bot de Telegram encendido...');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
