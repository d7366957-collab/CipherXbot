// public/js/api.js

// Usa el dominio actual (https://cipherrx.duckdns.org) para las peticiones
const API_URL = window.location.origin;

// 1. Obtener datos del usuario
async function fetchUserData(telegramId) {
    try {
        const res = await fetch(`${API_URL}/api/user/${telegramId}`);
        if (!res.ok) throw new Error('Usuario no encontrado');
        return await res.json();
    } catch (err) {
        console.error('Error fetchUserData:', err);
        return null;
    }
}

// 2. Obtener estado del Pool (Fase 1 o 2)
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

// 3. Solicitar un retiro
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

// 4. Registrar un depósito (TXID)
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
