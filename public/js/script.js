document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector(".sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const homeSection = document.querySelector(".home-section");

    function toggleSidebar() {
        sidebar.classList.toggle("close");
        homeSection.classList.toggle("close");
        sidebarToggle.classList.toggle("rotate");
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", toggleSidebar);
    }

    function handleResize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add("close");
            homeSection.classList.add("close");
        } else {
            sidebar.classList.remove("close");
            homeSection.classList.remove("close");
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Llamar la función al cargar la página
});