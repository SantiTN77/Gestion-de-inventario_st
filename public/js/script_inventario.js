console.log('script_inventario.js cargado');

const InventoryApp = (function() {
    let inventoryData = [];
    let categories = [];
    let sidebar, sidebarToggle, homeSection;

    // Elementos del DOM
    let productModal,
        categoryModal,
        addProductBtn,
        addCategoryBtn,
        closeButtons,
        productForm,
        categoryForm,
        searchInput,
        categoryFilter,
        priceFilter,
        gridViewBtn,
        listViewBtn,
        inventoryGallery;

    function init() {
        console.log('Inicializando InventoryApp');
        cacheDOMElements();
        bindEvents();
        loadCategories();
        loadInventoryData();
        handleResize(); // Inicializar el estado responsive
    }

    function cacheDOMElements() {
        console.log('Cacheando elementos DOM');
        productModal = document.getElementById('productModal');
        categoryModal = document.getElementById('categoryModal');
        addProductBtn = document.getElementById('addProductBtn');
        addCategoryBtn = document.getElementById('addCategoryBtn');
        closeButtons = document.querySelectorAll('.close');
        productForm = document.getElementById('productForm');
        categoryForm = document.getElementById('categoryForm');
        searchInput = document.getElementById('searchInventory');
        categoryFilter = document.getElementById('categoryFilter');
        priceFilter = document.getElementById('priceFilter');
        gridViewBtn = document.getElementById('gridViewBtn');
        listViewBtn = document.getElementById('listViewBtn');
        inventoryGallery = document.getElementById('inventoryGallery');
        
        // Elementos del sidebar
        sidebar = document.querySelector(".sidebar");
        sidebarToggle = document.querySelector(".sidebarBtn");
        homeSection = document.querySelector(".home-section");
    }

    function bindEvents() {
        console.log('Vinculando eventos');
        if (addProductBtn) {
            console.log('Botón addProduct encontrado');
            addProductBtn.addEventListener('click', openProductModal);
        } else {
            console.error('Botón addProduct no encontrado');
        }
        
        if (addCategoryBtn) {
            console.log('Botón addCategory encontrado');
            addCategoryBtn.addEventListener('click', openCategoryModal);
        } else {
            console.error('Botón addCategory no encontrado');
        }

        // Resto de los eventos
        closeButtons.forEach(button => 
            button.addEventListener('click', () => closeModal(button))
        );
        
        if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);
        if (categoryForm) categoryForm.addEventListener('submit', handleCategoryFormSubmit);
        if (searchInput) searchInput.addEventListener('input', handleSearch);
        if (categoryFilter) categoryFilter.addEventListener('change', handleFilters);
        if (priceFilter) priceFilter.addEventListener('input', handleFilters);
        if (gridViewBtn) gridViewBtn.addEventListener('click', () => switchView('grid'));
        if (listViewBtn) listViewBtn.addEventListener('click', () => switchView('list'));
        
        // Eventos del sidebar
        if (sidebarToggle) {
            sidebarToggle.addEventListener("click", toggleSidebar);
        }
        
        window.addEventListener('resize', handleResize);
    }

    // Funciones del sidebar
    function toggleSidebar() {
        sidebar.classList.toggle("close");
        homeSection.classList.toggle("close");
        sidebarToggle.classList.toggle("rotate");
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

    // Cargar categorías desde controllers
    function loadCategories() {
        fetch('../controllers/category_actions.php?action=getCategories')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    categories = data.categories;
                    renderCategories();
                } else {
                    console.error('Error al cargar categorías:', data.message);
                }
            })
            .catch(error => console.error('Error al cargar categorías:', error));
    }

    // Cargar datos de inventario
    function loadInventoryData() {
        fetch('../controllers/product_actions.php?action=getProducts')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    inventoryData = data.products;
                    renderInventory();
                } else {
                    console.error('Error al cargar inventario:', data.message);
                }
            })
            .catch(error => console.error('Error al cargar inventario:', error));
    }

    // Abrir el modal de producto
    function openProductModal() {
        if (productModal) {
            productModal.style.display = 'block';
            document.getElementById('modalTitle').textContent = 'Agregar Producto';
            productForm.reset();
            document.getElementById('productId').value = '';
        }
    }

    // Abrir el modal de categoría
    function openCategoryModal() {
        if (categoryModal) {
            categoryModal.style.display = 'block';
        }
    }

    // Cerrar el modal (se recibe el botón que cerró para obtener el modal)
    function closeModal(closeElement) {
        const modal = closeElement.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Envío del formulario de producto
    function handleProductFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(productForm);
        const productId = document.getElementById('productId').value;
        formData.append('action', productId ? 'editProduct' : 'saveProduct');

        fetch('../controllers/product_actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showConfirmation(data.message);
                loadInventoryData();
                const closeBtn = productModal.querySelector('.close');
                if (closeBtn) closeModal(closeBtn);
                productForm.reset();
            } else {
                showNotification('Error al guardar el producto: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al guardar el producto', 'error');
        });
    }

    // Envío del formulario de categoría
    function handleCategoryFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(categoryForm);
        formData.append('action', 'saveCategory');

        fetch('../controllers/category_actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showConfirmation(data.message);
                loadCategories();
                const closeBtn = categoryModal.querySelector('.close');
                if (closeBtn) closeModal(closeBtn);
                categoryForm.reset();
            } else {
                showNotification('Error al guardar la categoría: ' + data.message, 'error');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Manejo de búsqueda y filtros
    function handleSearch() {
        handleFilters();
    }

    function handleFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const maxPrice = priceFilter ? parseFloat(priceFilter.value) || Infinity : Infinity;

        const filteredData = inventoryData.filter(product => 
            product.nombre.toLowerCase().includes(searchTerm) &&
            (selectedCategory === '' || product.categoria == selectedCategory) &&
            product.precio <= maxPrice
        );
        renderInventory(filteredData);
    }

    // Cambiar la vista entre grid y list
    function switchView(view) {
        if (inventoryGallery) {
            inventoryGallery.className = `inventory-gallery ${view}-view`;
        }
        if (gridViewBtn) gridViewBtn.classList.toggle('active', view === 'grid');
        if (listViewBtn) listViewBtn.classList.toggle('active', view === 'list');
        renderInventory();
    }

    // Renderizar categorías en selectores
    function renderCategories() {
        const categoryOptions = categories.map(category => 
            `<option value="${category.id}">${category.nombre}</option>`
        ).join('');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + categoryOptions;
        }
        const productCategorySelect = document.getElementById('productCategory');
        if (productCategorySelect) {
            productCategorySelect.innerHTML = categoryOptions;
        }
    }

    // Renderizar el inventario de productos
    function renderInventory(data = inventoryData) {
        inventoryGallery.innerHTML = '';
        if (data.length === 0) {
            inventoryGallery.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }
        data.forEach(product => {
            const productElement = document.createElement('div');
            const baseUrl = '/Inventario';  // Base URL para imágenes
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <img src="${product.imagen 
                    ? (product.imagen.startsWith('/') 
                        ? baseUrl + product.imagen 
                        : baseUrl + '/controllers/uploads/' + product.imagen) 
                    : baseUrl + '/public/uploads/default-product.png'}" alt="${product.nombre}">
                <h3>${product.nombre}</h3>
                <p>Categoría: ${product.categoria}</p>
                <p>Precio: $${parseFloat(product.precio).toFixed(2)}</p>
                <p>Cantidad: ${product.cantidad}</p>
                <div class="product-actions">
                    <button onclick="InventoryApp.editProduct(${product.id})">Editar</button>
                    <button onclick="InventoryApp.deleteProduct(${product.id})">Eliminar</button>
                </div>
            `;
            inventoryGallery.appendChild(productElement);
        });
    }

    // Editar producto – precarga el formulario con los datos
    function editProduct(id) {
        fetch(`../controllers/product_actions.php?action=getProducts&id=${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.products.length > 0) {
                    const product = data.products[0];
                    document.getElementById('productId').value = product.id || '';
                    document.getElementById('productName').value = product.nombre || '';
                    document.getElementById('productCategory').value = product.categoria || '';
                    document.getElementById('productPrice').value = product.precio || '';
                    document.getElementById('productQuantity').value = product.cantidad || '';
                    document.getElementById('modalTitle').textContent = 'Editar Producto';
                    openProductModal();
                } else {
                    console.error('Error al obtener datos del producto:', data.message);
                }
            })
            .catch(error => console.error('Error al editar producto:', error));
    }

    // Eliminar producto con confirmación
    function deleteProduct(id) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content confirmation-modal">
                <h2>Confirmar eliminación</h2>
                <p>¿Estás seguro de que quieres eliminar este producto?</p>
                <div class="button-group">
                    <button id="confirmDelete" class="btn btn-danger">Eliminar</button>
                    <button id="cancelDelete" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('confirmDelete').addEventListener('click', () => {
            fetch(`../controllers/product_actions.php?action=deleteProduct&id=${id}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Producto eliminado exitosamente', 'success');
                    loadInventoryData();
                } else {
                    showNotification('Error al eliminar el producto: ' + data.message, 'error');
                }
                modal.remove();
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al eliminar el producto', 'error');
                modal.remove();
            });
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            modal.remove();
        });
    }

    // Mostrar confirmación en un modal
    function showConfirmation(message) {
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'modal';
        confirmationModal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Confirmación</h2>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(confirmationModal);
        confirmationModal.style.display = 'block';
        const closeBtn = confirmationModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                confirmationModal.style.display = 'none';
                confirmationModal.remove();
            };
        }
    }

    return {
        init: init,
        loadInventory: loadInventoryData,
        editProduct: editProduct,
        deleteProduct: deleteProduct
    };
})();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando InventoryApp');
    InventoryApp.init();
});