// public/js/profile.js

// Esta función se llama desde app.js al iniciar
window.initProfile = function() {
    // Si el usuario de Telegram está cargado, mostramos su ID
    if (currentUser && currentUser.id) {
        const idElement = document.getElementById('user-id');
        if (idElement) {
            idElement.textContent = `ID: ${currentUser.id}`;
        }
    }
};
