// public/js/wallet.js

window.renderWallet = async function(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="spinner" style="border: 3px solid #1A2332; border-top: 3px solid #00A3FF; border-radius: 50%; width: 40px; height: 40px; margin: 0 auto; animation: spin 1s linear infinite;"></div>
            <p style="color: #8A9BB0; margin-top: 16px;">Cargando billetera...</p>
        </div>
    `;

    try {
        const user = await fetchUserData(currentUser.id);
        const config = await fetchPlatformStatus();
        
        const withdrawable = user ? parseFloat(user.withdrawable_balance).toFixed(2) : '0.00';

        container.innerHTML = `
            <!-- TARJETA DE SALDO Y BOTONES -->
            <div class="card card-entrance">
                <div class="card-header">
                    <span class="card-title">💰 SALDO RETIRABLE</span>
                    <img src="../assets/icons/monedaa.png" alt="USDT" style="width: 24px; height: 24px;">
                </div>
                <div class="balance-total" style="color: var(--accent-green);">${withdrawable} <span style="font-size: 14px;">USDT</span></div>
                
                <div class="btn-row">
                    <button class="btn-secondary" onclick="openWithdrawModal()">RETIRAR</button>
                    <button class="btn-primary" onclick="openDepositModal()">DEPOSITAR</button>
                </div>
            </div>

            <!-- HISTORIAL -->
            <div class="card card-entrance" style="animation-delay: 0.1s;">
                <div class="card-header">
                    <span class="card-title">📜 HISTORIAL</span>
                </div>
                <div id="history-list">
                    <p style="color: #8A9BB0; text-align: center; font-size: 13px; padding: 20px 0;">Cargando historial...</p>
                </div>
            </div>

            <!-- MODAL DE DEPÓSITO -->
            <div id="deposit-modal" class="modal">
                <div class="modal-content" style="text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 style="font-size: 18px;">💳 DEPOSITAR</h2>
                        <button onclick="closeModal('deposit-modal')" style="background: none; border: none; color: #8A9BB0; font-size: 24px; cursor: pointer;">✕</button>
                    </div>
                    
                    <p style="font-size: 12px; color: #8A9BB0; margin-bottom: 12px;">Mínimo: 10 USDT</p>
                    
                    <label style="font-size: 12px; color: #8A9BB0;">Selecciona la Red:</label>
                    <div style="display: flex; gap: 8px; margin: 8px 0 16px 0;">
                        <button class="btn-secondary" onclick="selectNetwork('BEP20')" id="net-BEP20" style="padding: 10px; font-size: 12px;">BEP20 <img src="../assets/icons/bnb.png" style="width: 14px;"></button>
                        <button class="btn-secondary" onclick="selectNetwork('TRC20')" id="net-TRC20" style="padding: 10px; font-size: 12px; opacity: 0.6;">TRC20 <img src="../assets/icons/trx.png" style="width: 14px;"></button>
                        <button class="btn-secondary" onclick="selectNetwork('TON')" id="net-TON" style="padding: 10px; font-size: 12px; opacity: 0.6;">TON <img src="../assets/icons/ton.png" style="width: 14px;"></button>
                    </div>

                    <label style="font-size: 12px; color: #8A9BB0;">Dirección Maestra:</label>
                    <div class="input-field" id="deposit-address" style="margin-top: 4px; font-size: 12px; overflow: hidden; text-overflow: ellipsis;">Selecciona una red</div>
                    <button class="btn-secondary" onclick="copyAddress()" style="margin-bottom: 16px; padding: 10px; font-size: 12px;">📋 COPIAR DIRECCIÓN</button>

                    <label style="font-size: 12px; color: #8A9BB0;">Pega el TXID de tu transacción:</label>
                    <input type="text" id="deposit-txid" class="input-field" placeholder="0x..." style="margin-top: 4px;">
                    
                    <button class="btn-primary" onclick="submitDeposit()" id="btn-submit-deposit">VERIFICAR</button>
                </div>
            </div>

            <!-- MODAL DE RETIRO -->
            <div id="withdraw-modal" class="modal">
                <div class="modal-content" style="text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 style="font-size: 18px;">💸 RETIRAR</h2>
                        <button onclick="closeModal('withdraw-modal')" style="background: none; border: none; color: #8A9BB0; font-size: 24px; cursor: pointer;">✕</button>
                    </div>

                    <p style="font-size: 12px; color: #8A9BB0; margin-bottom: 12px;">Saldo disponible: ${withdrawable} USDT</p>

                    <label style="font-size: 12px; color: #8A9BB0;">Monto a retirar (Mín. 5):</label>
                    <input type="number" id="withdraw-amount" class="input-field" placeholder="0.00" style="margin-top: 4px;">

                    <label style="font-size: 12px; color: #8A9BB0;">Dirección de destino:</label>
                    <input type="text" id="withdraw-address" class="input-field" placeholder="Tu dirección..." style="margin-top: 4px;">

                    <label style="font-size: 12px; color: #8A9BB0;">Red:</label>
                    <div style="display: flex; gap: 8px; margin: 8px 0 16px 0;">
                        <button class="btn-secondary" onclick="selectWithdrawNetwork('BEP20')" id="wnet-BEP20" style="padding: 10px; font-size: 12px;">BEP20</button>
                        <button class="btn-secondary" onclick="selectWithdrawNetwork('TRC20')" id="wnet-TRC20" style="padding: 10px; font-size: 12px; opacity: 0.6;">TRC20</button>
                        <button class="btn-secondary" onclick="selectWithdrawNetwork('TON')" id="wnet-TON" style="padding: 10px; font-size: 12px; opacity: 0.6;">TON</button>
                    </div>

                    <button class="btn-primary" onclick="submitWithdrawal()" id="btn-submit-withdraw">SOLICITAR RETIRO</button>
                </div>
            </div>
        `;

        loadHistory(user ? user.id : null);

    } catch (err) {
        container.innerHTML = `<div class="card" style="color: #FF4D5E; text-align: center;">Error al cargar la billetera.</div>`;
    }
};

// Variables para controlar la red seleccionada
let selectedNetwork = 'BEP20';
let selectedWithdrawNetwork = 'BEP20';

window.openDepositModal = () => document.getElementById('deposit-modal').classList.add('show');
window.openWithdrawModal = () => document.getElementById('withdraw-modal').classList.add('show');
window.closeModal = (id) => document.getElementById(id).classList.remove('show');

window.selectNetwork = (net) => {
    selectedNetwork = net;
    ['BEP20', 'TRC20', 'TON'].forEach(n => {
        document.getElementById(`net-${n}`).style.opacity = n === net ? '1' : '0.6';
    });
    const addresses = { BEP20: '0x123abc...', TRC20: 'TXYZ123...', TON: 'UQabc123...' };
    document.getElementById('deposit-address').textContent = addresses[net];
};

window.copyAddress = () => {
    const addr = document.getElementById('deposit-address').textContent;
    navigator.clipboard.writeText(addr);
    showToast('Dirección copiada ✅');
};

window.submitDeposit = async () => {
    const txid = document.getElementById('deposit-txid').value.trim();
    if (!txid || txid.length < 10) return showToast('❌ TXID inválido');

    const btn = document.getElementById('btn-submit-deposit');
    btn.textContent = 'VERIFICANDO...';
    btn.disabled = true;

    const res = await apiSubmitDeposit(currentUser.id, txid, selectedNetwork);
    
    if (res.ok) {
        showToast('✅ Depósito enviado a verificación.');
        closeModal('deposit-modal');
    } else {
        showToast('❌ ' + res.message);
    }
    
    btn.textContent = 'VERIFICAR';
    btn.disabled = false;
};

window.selectWithdrawNetwork = (net) => {
    selectedWithdrawNetwork = net;
    ['BEP20', 'TRC20', 'TON'].forEach(n => {
        document.getElementById(`wnet-${n}`).style.opacity = n === net ? '1' : '0.6';
    });
};

window.submitWithdrawal = async () => {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const address = document.getElementById('withdraw-address').value.trim();

    if (!amount || amount < 5) return showToast('❌ El mínimo es 5 USDT');
    if (!address || address.length < 10) return showToast('❌ Dirección inválida');

    const btn = document.getElementById('btn-submit-withdraw');
    btn.textContent = 'PROCESANDO...';
    btn.disabled = true;

    const res = await apiRequestWithdrawal(currentUser.id, amount, address, selectedWithdrawNetwork);
    
    if (res.ok) {
        showToast('✅ Retiro solicitado. Procesando 0-24h.');
        closeModal('withdraw-modal');
    } else {
        showToast('⚠️ ' + res.message);
    }

    btn.textContent = 'SOLICITAR RETIRO';
    btn.disabled = false;
};

async function loadHistory(userId) {
    const historyHTML = `
        <div class="history-row">
            <div class="history-left">
                <span class="history-title">✅ Depósito</span>
                <span class="history-date">15 Nov 2025 · 14:32</span>
            </div>
            <div class="history-right">
                <span class="history-amount amount-plus">+10.00 USDT</span>
                <span class="status-completed">Completado</span>
            </div>
        </div>
        <div class="history-row">
            <div class="history-left">
                <span class="history-title">⏳ Retiro</span>
                <span class="history-date">14 Nov 2025 · 09:15</span>
            </div>
            <div class="history-right">
                <span class="history-amount amount-minus">-5.00 USDT</span>
                <span class="status-pending">Procesando</span>
            </div>
        </div>
    `;
    document.getElementById('history-list').innerHTML = historyHTML;
}
