document.addEventListener('DOMContentLoaded', function() {
    const nuevaVentaBtn = document.getElementById('nuevaVentaBtn');
    const nuevoClienteBtn = document.getElementById('nuevoClienteBtn');
    const nuevaCategoriaBtn = document.getElementById('nuevaCategoriaBtn');
    
    const ventaModal = document.getElementById('ventaModal');
    const clienteModal = document.getElementById('clienteModal');
    const categoriaModal = document.getElementById('categoriaModal');
    
    nuevaVentaBtn.addEventListener('click', () => ventaModal.style.display = 'block');
    nuevoClienteBtn.addEventListener('click', () => clienteModal.style.display = 'block');
    nuevaCategoriaBtn.addEventListener('click', () => categoriaModal.style.display = 'block');
    
    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
});