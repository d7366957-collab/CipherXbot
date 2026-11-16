// public/js/app.js

const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#0A0E17');
tg.setBackgroundColor('#0A0E17');

let currentUser = null;
let platformConfig = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener datos del usuario de Telegram
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        currentUser = tg.initDataUnsafe.user;
        document.getElementById('user-name').textContent = currentUser.first_name || 'Trader';
        document.getElementById('user-id').textContent = `ID: ${currentUser.id}`;
        
        if (currentUser.photo_url) {
            document.getElementById('user-avatar').src = currentUser.photo_url;
        }
    }

    // 2. Lógica para copiar el ID
    document.getElementById('copy-id').addEventListener('click', () => {
        if (currentUser) {
            navigator.clipboard.writeText(currentUser.id.toString());
            showToast('ID copiado ✅');
        }
    });

    // 3. Cargar la pestaña por defecto (Inicio)
    switchTab('inicio', document.querySelector('.nav-item.active'));

    // 4. Iniciar el contador del pool
    startPoolTimer();
});

// Función para cambiar de pestaña
window.switchTab = function(tabName, btnElement) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const content = document.getElementById('app-content');
    
    if (tabName === 'inicio') {
        renderDashboard(content);
    } else if (tabName === 'amigos') {
        renderReferrals(content);
    } else if (tabName === 'billetera') {
        renderWallet(content);
    }
};

// Menú de 3 puntos
window.openMenu = function() {
    const menu = document.getElementById('dropdown-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
};

document.addEventListener('click', (e) => {
    const menu = document.getElementById('dropdown-menu');
    if (!e.target.closest('.top-actions') && menu.style.display === 'flex') {
        menu.style.display = 'none';
    }
});

// Abrir Soporte (Tu chat personal)
window.openSupport = function() {
    const supportUsername = 'TuUsuarioAdmin'; // 👈 CAMBIA POR TU USER DE TELEGRAM
    tg.openTelegramLink(`https://t.me/${supportUsername}`);
};

// Notificaciones Toast
window.showToast = function(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Contador del Pool en Tiempo Real
function startPoolTimer() {
    let remaining = 50000;
    const totalDuration = 5 * 24 * 60 * 60 * 1000;
    const start = Date.now();

    setInterval(() => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / totalDuration, 1);
        
        let consumed = 0;
        const curve = [{t:0,c:0},{t:0.2,c:2000},{t:0.4,c:7000},{t:0.6,c:17000},{t:0.8,c:32000},{t:1,c:50000}];
        
        for (let i = 0; i < curve.length - 1; i++) {
            if (progress >= curve[i].t && progress <= curve[i+1].t) {
                const ratio = (progress - curve[i].t) / (curve[i+1].t - curve[i].t);
                consumed = curve[i].c + (curve[i+1].c - curve[i].c) * ratio;
                break;
            }
        }
        
        remaining = Math.max(0, 50000 - consumed);
        
        const amountEl = document.getElementById('pool-amount');
        const progressEl = document.getElementById('pool-progress');
        const countdownEl = document.getElementById('pool-countdown');

        if (amountEl) amountEl.textContent = `${remaining.toLocaleString('en-US', {minimumFractionDigits: 2})} / 50,000 USDT`;
        if (progressEl) progressEl.style.width = `${(remaining / 50000) * 100}%`;

        if (countdownEl) {
            const msLeft = totalDuration - elapsed;
            if (msLeft > 0) {
                const d = Math.floor(msLeft / (1000 * 60 * 60 * 24));
                const h = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
                const m = Math.floor((msLeft / (1000 * 60)) % 60);
                countdownEl.textContent = `⏳ ${d}d ${h}h ${m}m`;
            } else {
                countdownEl.textContent = '⚠️ Pool agotado';
                document.getElementById('pool-container').style.display = 'none';
            }
        }
    }, 1000);
      }
