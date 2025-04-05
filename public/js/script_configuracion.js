// JavaScript para funcionalidad de la página de configuración

// Función para mostrar modal de editar perfil
function showEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');

    // Lógica para prellenar el formulario con datos del perfil actual (simulación)
    fullNameInput.value = 'Nombre Apellido';
    emailInput.value = 'correo@example.com';

    modal.style.display = 'block';
}

// Función para cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Evento para abrir modal de editar perfil
document.getElementById('editProfileBtn').addEventListener('click', function() {
    showEditProfileModal();
});

// Evento para cerrar modal al hacer clic en X
document.querySelectorAll('.close').forEach(function(closeBtn) {
    closeBtn.addEventListener('click', function() {
        const modalId = this.closest('.modal').id;
        closeModal(modalId);
    });
});

// Evento para cerrar modal al hacer clic fuera del modal
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
};

// Evento para guardar cambios en el formulario de editar perfil
document.getElementById('editProfileForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;

    // Aquí podrías enviar los datos a tu backend para actualizar el perfil (simulación)
    console.log('Datos actualizados del perfil:', {
        fullName: fullName,
        email: email
    });

    // Cerrar modal después de guardar
    closeModal('editProfileModal');
});

// Evento para cambiar contraseña
document.getElementById('changePasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Aquí deberías validar y enviar los datos a tu backend para cambiar la contraseña
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
    } else {
        console.log('Contraseña cambiada con éxito:', {
            currentPassword: currentPassword,
            newPassword: newPassword
        });

        // Cerrar modal después de guardar
        closeModal('changePasswordModal');
    }
});

// Evento para guardar configuración de notificaciones por email
document.getElementById('emailNotificationsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const emailNotificationToggle = document.getElementById('emailNotificationToggle').checked;
    const emailAddress = document.getElementById('emailAddress').value;

    // Aquí podrías enviar los datos a tu backend para guardar la configuración de notificaciones
    console.log('Configuración de notificaciones guardada:', {
        receiveNotifications: emailNotificationToggle,
        email: emailAddress
    });

    // Cerrar modal después de guardar
    closeModal('emailNotificationsModal');
});
