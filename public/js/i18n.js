// public/js/i18n.js

const locales = {
    en: {
        "nav_home": "Home",
        "nav_friends": "Friends",
        "nav_wallet": "Wallet",
        "support": "SUPPORT",
        "balance_total": "TOTAL BALANCE",
        "frozen": "FROZEN",
        "withdrawable": "WITHDRAWABLE",
        "daily_yield": "DAILY YIELD",
        "team_ops": "TEAM OPERATIONS",
        "claim_bonus": "CLAIM $40",
        "about_us": "About Us",
        "terms": "Terms & Conditions",
        "language": "Language",
        "about_text": `CipherX: The Future of Institutional Copy-Trading\n\nCipherX is not just a platform; it is a financial ecosystem designed to democratize access to high-yield trading strategies. We were born with the vision of merging the security of traditional finance (TradFi) with the agility and transparency of blockchain technology.\n\nOur Executive Team:\n• Alexander "Alex" Sterling (CEO & Chief Strategist): Former Head of Derivatives Trading at an elite London hedge fund.\n• Dr. Elena Volkov (CTO): Former Principal Infrastructure Engineer in Silicon Valley.\n• Marcus Chen (Head of Quantitative Trading): Former quantitative analyst on Wall Street.\n• Sarah Jenkins (Head of Risk Management): Veteran in investment banking.\n\nThe CipherX Strategy:\n1. Micro-Liquidity Analysis: Our algorithm scans thousands of orders per second.\n2. Adaptive Triangular Arbitrage: We exploit price inefficiencies between multiple pairs.\n3. Dynamic Hedging: Capital is protected by a derivatives layer.\n\nAt CipherX, we don't guess the market; we calculate it.`
    },
    es: {
        "nav_home": "Inicio",
        "nav_friends": "Amigos",
        "nav_wallet": "Billetera",
        "support": "SOPORTE",
        "balance_total": "SALDO TOTAL",
        "frozen": "CONGELADO",
        "withdrawable": "RETIRABLE",
        "daily_yield": "RENDIMIENTO DEL DÍA",
        "team_ops": "OPERACIONES DEL EQUIPO",
        "claim_bonus": "RECLAMAR $40",
        "about_us": "Sobre Nosotros",
        "terms": "Términos y Condiciones",
        "language": "Idioma",
        "about_text": `CipherX: El Futuro del Copy-Trading Institucional\n\nCipherX no es solo una plataforma; es un ecosistema financiero diseñado para democratizar el acceso a las estrategias de trading de alto rendimiento. Nacimos con la visión de fusionar la seguridad de las finanzas tradicionales con la tecnología blockchain.\n\nNuestro Equipo Directivo:\n• Alexander "Alex" Sterling (CEO y Estratega Jefe): Ex-Jefe de Trading de Derivados en un fondo de élite en Londres.\n• Dr. Elena Volkov (CTO): Ex-ingeniera principal de infraestructura en Silicon Valley.\n• Marcus Chen (Jefe de Trading Cuantitativo): Ex-analista cuantitativo en Wall Street.\n• Sarah Jenkins (Jefa de Gestión de Riesgos): Veterana en banca de inversión.\n\nLa Estrategia CipherX:\n1. Análisis de Micro-Liquidez: Escanea miles de órdenes por segundo.\n2. Arbitraje Triangular Adaptativo: Aprovecha ineficiencias de precios.\n3. Cobertura Dinámica: El capital está protegido con derivados.\n\nEn CipherX, no adivinamos el mercado; lo calculamos.`
    },
    ru: {
        "nav_home": "Главная",
        "nav_friends": "Друзья",
        "nav_wallet": "Кошелек",
        "support": "ПОДДЕРЖКА",
        "balance_total": "ОБЩИЙ БАЛАНС",
        "frozen": "ЗАМОРОЖЕНО",
        "withdrawable": "ДОСТУПНО",
        "daily_yield": "ДНЕВНАЯ ДОХОДНОСТЬ",
        "team_ops": "ОПЕРАЦИИ КОМАНДЫ",
        "claim_bonus": "ПОЛУЧИТЬ $40",
        "about_us": "О нас",
        "terms": "Условия",
        "language": "Язык",
        "about_text": `CipherX: Будущее институционального копитрейдинга\n\nCipherX — это не просто платформа; это финансовая экосистема, созданная для демократизации доступа к высокодоходным торговым стратегиям.\n\nНаша команда:\n• Александр "Алекс" Стерлинг (CEO): Бывший глава отдела торговли деривативами в элитном хедж-фонде Лондона.\n• Д-р Елена Волкова (CTO): Бывший главный инженер инфраструктуры в Кремниевой долине.\n• Маркус Чен (Quant): Бывший количественный аналитик на Уолл-стрит.\n• Сара Дженкинс (Риск-менеджмент): Ветеран инвестиционного банкинга.\n\nСтратегия CipherX:\n1. Анализ микроликвидности\n2. Адаптивный треугольный арбитраж\n3. Динамическое хеджирование\n\nВ CipherX мы не угадываем рынок; мы его рассчитываем.`
    }
};

// Función para obtener texto según el idioma del usuario
window.t = function(key) {
    const lang = currentUser?.language_code || 'en'; // Telegram nos da el idioma del usuario
    const dict = locales[lang] || locales['en'];
    return dict[key] || key;
};

// Función para cambiar el idioma manualmente (desde el menú)
window.changeLanguage = function() {
    // Aquí podrías abrir un modal para elegir idioma
    // Por ahora, solo mostramos un mensaje
    showToast('Función de idioma en desarrollo');
};

// Función para mostrar "Sobre Nosotros"
window.showAbout = function() {
    const aboutText = window.t('about_text');
    
    // Crear un modal dinámico
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
