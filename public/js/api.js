// public/js/api.js

// URL del backend (en producción será tu dominio DuckDNS)
const API_URL = window.location.origin; // Toma la URL actual automáticamente

// Obtener los datos del usuario desde Telegram
async function fetchUserData(telegramId) {
    try {
        const res = await fetch(`${API_URL}/api/user/${telegramId}`);
        if (!res.ok) throw new Error('Error al obtener usuario');
        return await res.json();
    } catch (err) {
        console.error('Error fetchUserData:', err);
        return null;
    }
}

// Obtener el estado del Pool (Fase 1 o 2)
async function fetchPlatformStatus() {
    try {
        const res = await fetch(`${API_URL}/api/platform/status`);
        if (!res.ok) throw new Error('Error al obtener pool');
        return await res.json();
    } catch (err) {
        console.error('Error fetchPlatformStatus:', err);
        return null;
    }
}

// Reclamar el bono de $40
async function apiClaimBonus(telegramId) {
    try {
        const res = await fetch(`${API_URL}/api/user/claim-bonus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId })
        });
        return await res.json();
    } catch (err) {
        console.error('Error apiClaimBonus:', err);
        return { ok: false, message: 'Error de conexión' };
    }
}

// Solicitar un retiro
async function apiRequestWithdrawal(telegramId, amount, address, network) {
    try {
        const res = await fetch(`${API_URL}/api/wallet/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, amount, address, network })
        });
        return await res.json();
    } catch (err) {
        console.error('Error apiRequestWithdrawal:', err);
        return { ok: false, message: 'Error de conexión' };
    }
}

// Registrar un depósito (TXID)
async function apiSubmitDeposit(telegramId, txid, network) {
    try {
        const res = await fetch(`${API_URL}/api/wallet/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, txid, network })
        });
        return await res.json();
    } catch (err) {
        console.error('Error apiSubmitDeposit:', err);
        return { ok: false, message: 'Error de conexión' };
    }
          }
