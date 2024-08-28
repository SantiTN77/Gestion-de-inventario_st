// Módulo principal
const DashboardApp = (function() {
    // Variables privadas
    let sidebar, sidebarBtn, searchBox, profileDetails, navLinks, numbers;

    // Función de inicialización
    function init() {
        cacheDOMElements();
        bindEvents();
        updateNumbers();
    }

    // Cachear elementos del DOM
    function cacheDOMElements() {
        sidebar = document.querySelector(".sidebar");
        sidebarBtn = document.getElementById("sidebarToggle");
        searchBox = document.querySelector('.search-box input');
        profileDetails = document.querySelector('.profile-details');
        navLinks = document.querySelectorAll('.nav-links li a');
        numbers = document.querySelectorAll('.number');
    }

    // Vincular eventos
    function bindEvents() {
        sidebarBtn.addEventListener('click', toggleSidebar);
        searchBox.addEventListener('input', debounce(handleSearch, 300));
        profileDetails.addEventListener('click', toggleProfileMenu);
        navLinks.forEach(link => link.addEventListener('click', handleNavigation));
        window.addEventListener('resize', debounce(handleResize, 150));
    }

   

    // Manejar la búsqueda
    function handleSearch() {
        const searchTerm = this.value.toLowerCase();
        // Implementar la lógica de búsqueda aquí
        console.log('Buscando:', searchTerm);
        // Ejemplo: Filtrar elementos en el dashboard basado en el término de búsqueda
    }

    // Alternar el menú del perfil
    function toggleProfileMenu() {
        const profileMenu = document.querySelector('.profile-menu');
        if (profileMenu) {
            profileMenu.classList.toggle('active');
        } else {
            console.log('Menú de perfil no implementado');
        }
    }

    // Manejar la navegación
    function handleNavigation(e) {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        // Implementar lógica para cambiar el contenido de la sección principal
        const sectionId = this.getAttribute('href').slice(1);
        console.log('Navegando a:', sectionId);
        // Aquí se cargaría el contenido correspondiente a la sección
    }

    // Manejar el cambio de tamaño de la ventana
    function handleResize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove("active");
            document.querySelector('.home-section').classList.remove("sidebar-active");
        }
    }

    // Actualizar los números en tiempo real
    function updateNumbers() {
        numbers.forEach(number => {
            const target = parseInt(number.getAttribute('data-target'));
            const current = parseInt(number.innerText.replace(/[^0-9.-]+/g,""));
            const increment = (target - current) / 100;
            
            if (current < target) {
                number.innerText = '$' + Math.ceil(current + increment).toLocaleString();
                requestAnimationFrame(updateNumbers);
            } else {
                number.innerText = '$' + target.toLocaleString();
            }
        });
    }

    // Función de debounce para optimizar eventos frecuentes
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // API pública
    return {
        init: init
    };
})();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', DashboardApp.init);