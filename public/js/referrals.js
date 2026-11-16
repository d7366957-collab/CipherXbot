// public/js/referrals.js

// Esta función se llama desde app.js cuando el usuario toca la pestaña "Amigos"
window.renderReferrals = async function(container) {
    try {
        const user = await fetchUserData(currentUser.id);
        if (!user) throw new Error("Error al cargar");

        // El enlace de referido usa el telegram_id del usuario
        const refLink = `https://t.me/TuBotDeCipherX?start=${currentUser.id}`; // 👈 CAMBIA POR EL NOMBRE DE TU BOT

        container.innerHTML = `
            <!-- EXPLICACIÓN (Primero) -->
            <div class="card card-entrance" style="border-left: 3px solid var(--accent-blue);">
                <div class="card-header">
                    <span class="card-title">💡 CÓMO FUNCIONA</span>
                </div>
                <div style="font-size: 13px; line-height: 1.6; color: var(--text-muted);">
                    <p style="margin-bottom: 8px;">🎁 <strong>$1 USDT en congelado</strong> por cada amigo que invites.</p>
                    <p style="margin-bottom: 8px;">💰 <strong>10% de comisión</strong> de lo que deposite tu referido (va a tu saldo retirable).</p>
                    <p>♾️ <strong>Sin límite</strong> de referidos.</p>
                </div>
            </div>

            <!-- ENLACE DE REFERIDO -->
            <div class="card card-entrance" style="animation-delay: 0.1s;">
                <div class="card-header">
                    <span class="card-title">🔗 TU ENLACE DE REFERIDO</span>
                </div>
                <div class="input-field" style="font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center;">
                    ${refLink}
                </div>
                <button class="btn-secondary" onclick="copyRefLink('${refLink}')" style="margin-top: 8px;">📋 COPIAR ENLACE</button>
            </div>

            <!-- ESTADÍSTICAS (Abajo) -->
            <div class="card card-entrance" style="animation-delay: 0.2s;">
                <div class="card-header">
                    <span class="card-title">📊 TUS ESTADÍSTICAS</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--text-muted); font-size: 13px;">Amigos invitados</span>
                    <span style="font-family: 'JetBrains Mono', monospace; font-weight: bold;">0</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--text-muted); font-size: 13px;">Total en congelado</span>
                    <span style="font-family: 'JetBrains Mono', monospace; font-weight: bold; color: var(--accent-blue);">$0.00</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                    <span style="color: var(--text-muted); font-size: 13px;">Comisiones ganadas</span>
                    <span style="font-family: 'JetBrains Mono', monospace; font-weight: bold; color: var(--accent-green);">$0.00</span>
                </div>
            </div>

            <!-- BOTÓN COMPARTIR -->
            <button class="btn-primary" onclick="shareRefLink('${refLink}')" style="margin-top: 8px;">
                📤 COMPARTIR CON AMIGOS
            </button>
        `;

    } catch (err) {
        container.innerHTML = `<div class="card" style="color: #FF4D5E; text-align: center;">Error al cargar los referidos.</div>`;
    }
};

// Función para copiar el enlace
window.copyRefLink = (link) => {
    navigator.clipboard.writeText(link);
    showToast('Enlace copiado ✅');
};

// Función para compartir usando la API nativa de Telegram
window.shareRefLink = (link) => {
    const text = `🚀 ¡Únete a CipherX y gana rendimiento diario con Copy-Trading! Usa mi enlace:`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    
    // Abre el selector de contactos de Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
        window.open(shareUrl, '_blank');
    }
};
