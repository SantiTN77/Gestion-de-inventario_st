<?php
include('../config/db_config.php');
include_once('..//controllers/functions.php');

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Inventario - Arte y Cuero</title>
    <link rel="stylesheet" href="../public/css/styles_inventario.css">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <nav class="sidebar">
        <div class="logo-details">
            <span class="logo_name">Arte y Cuero</span>
        </div>
        <ul class="nav-links">
            <li>
                <a href="../views/panel_inventario.html">
                    <i class="fas fa-tachometer-alt"></i>
                    <span class="link_name">Dashboard</span>
                </a>
            </li>
            <li>
                <a href="../controller/inventario.php" class="active">
                    <i class="fas fa-box"></i>
                    <span class="link_name">Inventario</span>
                </a>
            </li>
           <li>
               <a href="../views/ventas.html"> 
                   <i class="fas fa-shopping-cart"></i>
                   <span class="link_name">Ventas</span>
               </a>
           </li>
           
            <li>
                <a href="../views/facturacion.html">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <span class="link_name">Facturación</span>
                </a>
            </li>
            <li>
                <a href="inventario/views/configuracion.html">
                    <i class="fas fa-cog"></i>
                    <span class="link_name">Configuración</span>
                </a>
            </li>
            <li class="log_out">
                <a href="Login.html">
                    <i class="fas fa-sign-out-alt"></i>
                    <span class="link_name">Cerrar Sesión</span>
                </a>
            </li>
        </ul>
    </nav>
    <section class="home-section">
        <header>
            <div class="header-content">
                <div class="sidebar-button">
                    <i class="fas fa-bars sidebarBtn"></i>
                    <span class="dashboard">Gestión de Inventario</span>
                </div>
                <div class="search-box">
                    <input type="text" id="searchInventory" placeholder="Buscar producto...">
                    <i class="fas fa-search"></i>
                </div>
                <div class="profile-details">
                    <i class="fas fa-user"></i>
                    <span class="admin_name">Admin</span>
                </div>
            </div>
        </header>
        <div class="inventory-content">
            <div class="top-actions">
                <div class="inventory-actions">
                    <button id="addProductBtn" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                    <button id="addCategoryBtn" class="btn btn-secondary">
                        <i class="fas fa-folder-plus"></i> Agregar Categoría
                    </button>
                </div>
                <div class="inventory-view-toggle">
                    <button id="gridViewBtn" class="active"><i class="fas fa-th"></i></button>
                    <button id="listViewBtn"><i class="fas fa-list"></i></button>
                </div>
            </div>
            <div class="inventory-filters">
                <select id="categoryFilter">
                    <option value="">Todas las categorías</option>
                    <?php echo getCategoryOptions(); ?>
                </select>
                <input type="number" id="priceFilter" placeholder="Precio máximo">
            </div>
            <div class="inventory-gallery" id="inventoryGallery">
                <!-- Los productos se insertarán aquí dinámicamente -->
            </div>
        </div>
    </section>
    
    <!-- Modal para agregar/editar producto -->
    <div id="productModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2 id="modalTitle">Agregar Producto</h2>
            <form id="productForm" enctype="multipart/form-data">
                <input type="hidden" id="productId" name="productId">
                <div class="form-group">
                    <label for="productName">Nombre:</label>
                    <input type="text" id="productName" name="productName" required>
                </div>
                <div class="form-group">
                    <label for="productCategory">Categoría:</label>
                    <select id="productCategory" name="productCategory" required>
                        <?php echo getCategoryOptions(); ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="productImage">Imagen:</label>
                    <input type="file" id="productImage" name="productImage" accept="image/*">
                </div>
                <div class="form-group">
                    <label for="productQuantity">Cantidad:</label>
                    <input type="number" id="productQuantity" name="productQuantity" required min="0">
                </div>
                <div class="form-group">
                    <label for="productPrice">Precio:</label>
                    <input type="number" id="productPrice" name="productPrice" required min="0" step="0.01">
                </div>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </form>
        </div>
    </div>

    <!-- Modal para agregar categoría -->
    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Agregar Categoría</h2>
            <form id="categoryForm">
                <div class="form-group">
                    <label for="categoryName">Nombre de la Categoría:</label>
                    <input type="text" id="categoryName" name="nombre" required>
                </div>
                <button type="submit" class="btn btn-primary">Guardar Categoría</button>
            </form>
        </div>
    </div>

    <script src="../public/js/script.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.querySelector(".sidebar");
            const sidebarToggle = document.querySelector(".sidebarBtn");
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
    </script>

</body>
</html>
