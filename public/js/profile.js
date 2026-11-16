// public/js/profile.js

// Esta función se llama desde app.js al iniciar
window.initProfile = function() {
    // El botón de copiar ID ya se configuró en app.js, 
    // pero aquí podemos agregar lógica extra si la necesitamos.
    // Por ahora, solo nos aseguramos de que el ID se vea bien.
    
    if (currentUser && currentUser.id) {
        const idElement = document.getElementById('user-id');
        if (idElement) {
            idElement.textContent = `ID: ${currentUser.id}`;
        }
    }
};
