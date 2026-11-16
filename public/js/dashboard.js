// public/js/dashboard.js

// Esta función se llama desde app.js cuando el usuario toca la pestaña "Inicio"
window.renderDashboard = async function(container) {
    // 1. Mostrar un loader mientras cargamos los datos
    container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="spinner" style="border: 3px solid #1A2332; border-top: 3px solid #00A3FF; border-radius: 50%; width: 40px; height: 40px; margin: 0 auto; animation: spin 1s linear infinite;"></div>
            <p style="color: #8A9BB0; margin-top: 16px;">Cargando datos...</p>
        </div>
    `;

    try {
        // 2. Pedir los datos al backend
        const user = await fetchUserData(currentUser.id);
        if (!user) throw new Error("No se pudo cargar el usuario");

        // 3. Construir el HTML del Dashboard
        const totalBalance = parseFloat(user.frozen_balance) + parseFloat(user.withdrawable_balance);
        const frozen = parseFloat(user.frozen_balance).toFixed(2);
        const withdrawable = parseFloat(user.withdrawable_balance).toFixed(2);

        // Aquí se simulan las operaciones (en producción vendrían del backend)
        const opsHTML = generarOperacionesHTML(user);

        container.innerHTML = `
            <!-- TARJETA DE SALDOS -->
            <div class="card card-entrance">
                <div class="card-header">
                    <span class="card-title">SALDO TOTAL</span>
                </div>
                <div class="balance-total">${totalBalance.toFixed(2)} <span style="font-size: 14px; color: #8A9BB0;">USDT</span></div>
                
                <div class="balance-split">
                    <div class="balance-box frozen">
                        <img src="../assets/icons/candado.png" alt="Congelado">
                        <span class="label">Congelado</span>
                        <span class="amount">${frozen}</span>
                    </div>
                    <div class="balance-box withdrawable">
                        <img src="../assets/icons/billetera.png" alt="Retirable">
                        <span class="label">Retirable</span>
                        <span class="amount">${withdrawable}</span>
                    </div>
                </div>
            </div>

            <!-- TARJETA DE RENDIMIENTO -->
            <div class="card card-entrance" style="animation-delay: 0.1s;">
                <div class="card-header">
                    <span class="card-title">📈 RENDIMIENTO DEL DÍA</span>
                    <span style="color: #00FF88; font-family: 'JetBrains Mono', monospace; font-weight: bold;">+0.75%</span>
                </div>
                <!-- Gráfica falsa (esto se puede reemplazar por un canvas real luego) -->
                <div style="height: 80px; display: flex; align-items: flex-end; gap: 4px; margin-top: 10px;">
                    <div style="flex: 1; height: 30%; background: linear-gradient(to top, rgba(0,163,255,0.1), #00A3FF); border-radius: 4px;"></div>
                    <div style="flex: 1; height: 50%; background: linear-gradient(to top, rgba(0,163,255,0.1), #00A3FF); border-radius: 4px;"></div>
                    <div style="flex: 1; height: 40%; background: linear-gradient(to top, rgba(0,163,255,0.1), #00A3FF); border-radius: 4px;"></div>
                    <div style="flex: 1; height: 70%; background: linear-gradient(to top, rgba(0,163,255,0.1), #00FF88); border-radius: 4px;"></div>
                    <div style="flex: 1; height: 60%; background: linear-gradient(to top, rgba(0,163,255,0.1), #00A3FF); border-radius: 4px;"></div>
                    <div style="flex: 1; height: 90%; background: linear-gradient(to top, rgba(0,163,255,0.1), #00FF88); border-radius: 4px;"></div>
                    <div style="flex: 1; height: 100%; background: linear-gradient(to top, rgba(0,163,255,0.1), #00FF88); border-radius: 4px;"></div>
                </div>
            </div>

            <!-- TARJETA DE OPERACIONES -->
            <div class="card card-entrance" style="animation-delay: 0.2s;">
                <div class="card-header">
                    <span class="card-title">📊 OPERACIONES DEL EQUIPO</span>
                    <span style="font-size: 11px; color: #8A9BB0;">Hoy · 7 trades</span>
                </div>
                <div class="ops-list">
                    ${opsHTML}
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 12px; border-top: 1px solid #1E2A3A;">
                    <span style="font-weight: bold;">Total del día</span>
                    <span style="color: #00FF88; font-family: 'JetBrains Mono', monospace; font-weight: bold;">+0.75%</span>
                </div>
            </div>
        `;

        // 4. Lógica para mostrar el modal del bono si es nuevo usuario
        if (!user.bonus_claimed) {
            document.getElementById('welcome-modal').classList.add('show');
        }

    } catch (err) {
        container.innerHTML = `
            <div class="card" style="text-align: center; color: #FF4D5E;">
                <p>Error al cargar los datos. Revisa tu conexión.</p>
                <button class="btn-secondary" onclick="renderDashboard(document.getElementById('app-content'))" style="margin-top: 16px;">Reintentar</button>
            </div>
        `;
    }
};

// Función auxiliar para generar las filas de operaciones
function generarOperacionesHTML(user) {
    // Simulamos las 7 operaciones (en el futuro esto vendría de la DB)
    const ops = [
        { pair: 'BTC/USDT', pnl: '+0.85%', usdt: '+0.42', pos: true },
        { pair: 'ETH/USDT', pnl: '+0.60%', usdt: '+0.30', pos: true },
        { pair: 'SOL/USDT', pnl: '-0.25%', usdt: '-0.12', pos: false },
        { pair: 'BNB/USDT', pnl: '+0.45%', usdt: '+0.22', pos: true },
        { pair: 'XRP/USDT', pnl: '+0.30%', usdt: '+0.15', pos: true },
        { pair: 'ADA/USDT', pnl: '-0.15%', usdt: '-0.07', pos: false },
        { pair: 'TON/USDT', pnl: '+0.40%', usdt: '+0.20', pos: true },
    ];

    return ops.map(op => `
        <div class="op-row">
            <div style="display: flex; align-items: center;">
                <span class="op-indicator ${op.pos ? 'ind-green' : 'ind-red'}"></span>
                <span class="op-pair">${op.pair}</span>
            </div>
            <div style="text-align: right;">
                <div class="${op.pos ? 'op-positive' : 'op-negative'}">${op.pnl}</div>
                <div style="font-size: 10px; color: #8A9BB0;">${op.usdt} USDT</div>
            </div>
        </div>
    `).join('');
}

// Función para reclamar el bono (conectada al botón del modal)
window.claimBonus = async function() {
    const btn = document.querySelector('#welcome-modal .btn-primary');
    btn.textContent = 'Procesando...';
    btn.disabled = true;

    const res = await apiClaimBonus(currentUser.id);
    
    if (res.ok) {
        document.getElementById('welcome-modal').classList.remove('show');
        showToast('✅ ¡Bono de $40 acreditado!');
        // Recargar el dashboard para ver el saldo actualizado
        renderDashboard(document.getElementById('app-content'));
    } else {
        btn.textContent = 'RECLAMAR $40';
        btn.disabled = false;
        showToast('❌ ' + (res.message || 'Error al reclamar'));
    }
};
