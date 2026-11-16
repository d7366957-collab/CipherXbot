const translations = {
  es: {
    welcome: "👋 ¡Bienvenido a <b>CipherX</b>!\n\nLa plataforma de Copy-Trading más avanzada de Telegram. Genera rendimiento diario con nuestro equipo de traders profesionales.\n\n🌐 Selecciona tu idioma o accede directamente:",
    btn_enter: "🚀 Acceder a CipherX",
    btn_lang: "🌐 Cambiar Idioma",
    lang_selected: "✅ Idioma actualizado a Español",
    choose_lang: "Selecciona tu idioma:"
  },
  en: {
    welcome: "👋 Welcome to <b>CipherX</b>!\n\nThe most advanced Copy-Trading platform on Telegram. Generate daily returns with our professional trading team.\n\n🌐 Select your language or access directly:",
    btn_enter: "🚀 Enter CipherX",
    btn_lang: "🌐 Change Language",
    lang_selected: "✅ Language updated to English",
    choose_lang: "Select your language:"
  },
  ru: {
    welcome: "👋 Добро пожаловать в <b>CipherX</b>!\n\nСамая продвинутая платформа для копитрейдинга в Telegram. Получайте ежедневную прибыль с нашей командой профессиональных трейдеров.\n\n🌐 Выберите язык или войдите напрямую:",
    btn_enter: "🚀 Войти в CipherX",
    btn_lang: "🌐 Изменить язык",
    lang_selected: "✅ Язык изменен на Русский",
    choose_lang: "Выберите язык:"
  }
};

const t = (lang, key) => {
  const l = translations[lang] ? lang : 'en';
  return translations[l][key] || translations['en'][key];
};

module.exports = { t };
