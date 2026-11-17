// public/js/i18n.js

const locales = {
    es: {
        "welcome": "👋 ¡Bienvenido a <b>CipherX</b>!\n\nLa plataforma de Copy-Trading más avanzada de Telegram. Genera rendimiento diario con nuestro equipo de traders profesionales.\n\n🌐 Selecciona tu idioma o accede directamente:",
        "btn_enter": "🚀 Acceder a CipherX",
        "btn_lang": "🌐 Cambiar Idioma",
        "lang_selected": "✅ Idioma actualizado a Español",
        "choose_lang": "Selecciona tu idioma:",
        "about_us": "Sobre Nosotros",
        "terms": "Términos y Condiciones",
        "language": "Idioma",
        "about_text": `CipherX: El Futuro del Copy-Trading Institucional\n\nCipherX no es solo una plataforma; es un ecosistema financiero diseñado para democratizar el acceso a las estrategias de trading de alto rendimiento. Nacimos con la visión de fusionar la seguridad de las finanzas tradicionales con la tecnología blockchain.\n\nNuestro Equipo Directivo:\n• Alexander "Alex" Sterling (CEO y Estratega Jefe): Ex-Jefe de Trading de Derivados en un fondo de élite en Londres.\n• Dr. Elena Volkov (CTO): Ex-ingeniera principal de infraestructura en Silicon Valley.\n• Marcus Chen (Jefe de Trading Cuantitativo): Ex-analista cuantitativo en Wall Street.\n• Sarah Jenkins (Jefa de Gestión de Riesgos): Veterana en banca de inversión.\n\nLa Estrategia CipherX:\n1. Análisis de Micro-Liquidez: Escanea miles de órdenes por segundo.\n2. Arbitraje Triangular Adaptativo: Aprovecha ineficiencias de precios.\n3. Cobertura Dinámica: El capital está protegido con derivados.\n\nEn CipherX, no adivinamos el mercado; lo calculamos.`
    },
    en: {
        "welcome": "👋 Welcome to <b>CipherX</b>!\n\nThe most advanced Copy-Trading platform on Telegram. Generate daily returns with our professional trading team.\n\n🌐 Select your language or access directly:",
        "btn_enter": "🚀 Enter CipherX",
        "btn_lang": "🌐 Change Language",
        "lang_selected": "✅ Language updated to English",
        "choose_lang": "Select your language:",
        "about_us": "About Us",
        "terms": "Terms & Conditions",
        "language": "Language",
        "about_text": `CipherX: The Future of Institutional Copy-Trading\n\nCipherX is not just a platform; it is a financial ecosystem designed to democratize access to high-yield trading strategies. We were born with the vision of merging the security of traditional finance (TradFi) with the agility and transparency of blockchain technology.\n\nOur Executive Team:\n• Alexander "Alex" Sterling (CEO & Chief Strategist): Former Head of Derivatives Trading at an elite London hedge fund.\n• Dr. Elena Volkov (CTO): Former Principal Infrastructure Engineer in Silicon Valley.\n• Marcus Chen (Head of Quantitative Trading): Former quantitative analyst on Wall Street.\n• Sarah Jenkins (Head of Risk Management): Veteran in investment banking.\n\nThe CipherX Strategy:\n1. Micro-Liquidity Analysis: Our algorithm scans thousands of orders per second.\n2. Adaptive Triangular Arbitrage: We exploit price inefficiencies between multiple pairs.\n3. Dynamic Hedging: Capital is protected by a derivatives layer.\n\nAt CipherX, we don't guess the market; we calculate it.`
    },
    ru: {
        "welcome": "👋 Добро пожаловать в <b>CipherX</b>!\n\nСамая продвинутая платформа для копитрейдинга в Telegram. Получайте ежедневную прибыль с нашей командой профессиональных трейдеров.\n\n🌐 Выберите язык или войдите напрямую:",
        "btn_enter": "🚀 Войти в CipherX",
        "btn_lang": "🌐 Изменить язык",
        "lang_selected": "✅ Язык изменен на Русский",
        "choose_lang": "Выберите язык:",
        "about_us": "О нас",
        "terms": "Условия",
        "language": "Язык",
        "about_text": `CipherX: Будущее институционального копитрейдинга\n\nCipherX — это не просто платформа; это финансовая экосистема, созданная для демократизации доступа к высокодоходным торговым стратегиям.\n\nНаша команда:\n• Александр "Алекс" Стерлинг (CEO): Бывший глава отдела торговли деривативами в элитном хедж-фонде Лондона.\n• Д-р Елена Волкова (CTO): Бывший главный инженер инфраструктуры в Кремниевой долине.\n• Маркус Чен (Quant): Бывший количественный аналитик на Уолл-стрит.\n• Сара Дженкинс (Риск-менеджмент): Ветеран инвестиционного банкинга.\n\nСтратегия CipherX:\n1. Анализ микроликвидности\n2. Адаптивный треугольный арбитраж\n3. Динамическое хеджирование\n\nВ CipherX мы не угадываем рынок; мы его рассчитываем.`
    }
};

// Función para obtener texto según el idioma del usuario
window.t = function(key) {
    const lang = currentUser?.language_code || 'es'; // Español por defecto
    const dict = locales[lang] || locales['es'];
    return dict[key] || key;
};

// Función para cambiar el idioma manualmente (desde el menú)
window.changeLanguage = function() {
    showToast('Función de idioma en desarrollo');
};

// Función para mostrar "Sobre Nosotros"
window.showAbout = function() {
    const aboutText = window.t('about_text');
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: left; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h2 style="font-size: 18px;">ℹ️ ${window.t('about_us')}</h2>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; color: #8A9BB0; font-size: 24px; cursor: pointer;">✕</button>
            </div>
            <div style="font-size: 13px; line-height: 1.6; color: #B0C0D0; white-space: pre-line;">
                ${aboutText}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};
