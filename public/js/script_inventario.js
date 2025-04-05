<<<<<<< HEAD
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
=======
// Al principio del archivo
console.log('script_inventario.js cargado');

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Reemplaza todas las instancias de alert() con showNotification()
// Por ejemplo:
// alert('Producto guardado exitosamente');
// se convierte en:
// showNotification('Producto guardado exitosamente', 'success');

// Y
// alert('Error al guardar el producto: ' + data.message);
// se convierte en:
// showNotification('Error al guardar el producto: ' + data.message, 'error');

// Asegúrate de que el modal no se muestre al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    const categoryModal = document.getElementById('categoryModal');
    
    if (productModal) productModal.style.display = 'none';
    if (categoryModal) categoryModal.style.display = 'none';

    loadProducts();
    // Resto del código de inicialización...
});

// Función para cargar productos
function loadProducts() {
    fetch('../controllers/product_actions.php?action=getProducts')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const productGallery = document.getElementById('inventoryGallery');
                productGallery.innerHTML = '';
                data.products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <img src="${product.imagen || '../public/img/default-product.jpg'}" alt="${product.nombre}">
                        <h3>${product.nombre}</h3>
                        <p>Categoría: ${product.categoria_nombre}</p>
                        <p>Precio: $${parseFloat(product.precio).toFixed(2)}</p>
                        <p>Cantidad: ${product.cantidad}</p>
                        <button class="btn btn-edit" onclick="editProduct(${product.id})">Editar</button>
                        <button class="btn btn-delete" onclick="deleteProduct(${product.id})">Eliminar</button>
                    `;
                    productGallery.appendChild(productCard);
                });
            } else {
                showNotification('Error al cargar productos: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al cargar productos', 'error');
        });
}

// Función para guardar producto
function saveProduct(formData) {
    fetch('../controllers/product_actions.php?action=saveProduct', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Producto guardado exitosamente', 'success');
            loadProducts();
            closeModal();
        } else {
            showNotification('Error al guardar el producto: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error al guardar el producto', 'error');
    });
}

// Función para eliminar producto
function deleteProduct(id) {
    console.log('Función deleteProduct llamada con id:', id);
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
        fetch(`../controllers/product_actions.php?action=deleteProduct&id=${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Producto eliminado exitosamente', 'success');
                    loadProducts(); // Recargar la lista de productos
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

// Asegúrate de que todas las funciones estén correctamente cerradas y no haya paréntesis extra

// Resto del código...

// Módulo de Inventario
const InventoryApp = (function() {
    // Variables privadas
    let inventoryData = [];
    let categories = [];

    // Elementos del DOM
    let productModal, categoryModal, addProductBtn, addCategoryBtn, closeButtons, productForm, categoryForm, searchInput, categoryFilter, priceFilter, gridViewBtn, listViewBtn, inventoryGallery;

    // Función de inicialización
    function init() {
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
        cacheDOMElements();
        bindEvents();
        loadCategories();
        loadInventoryData();
<<<<<<< HEAD
        handleResize(); // Inicializar el estado responsive
    }

    function cacheDOMElements() {
        console.log('Cacheando elementos DOM');
=======
    }

    function cacheDOMElements() {
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
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
<<<<<<< HEAD
        
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
        
=======
    }

    function bindEvents() {
        if (addProductBtn) addProductBtn.addEventListener('click', openProductModal);
        if (addCategoryBtn) addCategoryBtn.addEventListener('click', openCategoryModal);
        closeButtons.forEach(button => button.addEventListener('click', closeModal));
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
        if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);
        if (categoryForm) categoryForm.addEventListener('submit', handleCategoryFormSubmit);
        if (searchInput) searchInput.addEventListener('input', handleSearch);
        if (categoryFilter) categoryFilter.addEventListener('change', handleFilters);
        if (priceFilter) priceFilter.addEventListener('input', handleFilters);
        if (gridViewBtn) gridViewBtn.addEventListener('click', () => switchView('grid'));
        if (listViewBtn) listViewBtn.addEventListener('click', () => switchView('list'));
<<<<<<< HEAD
        
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
=======
    }

    // Cargar categorías
    function loadCategories() {
        fetch('category_actions.php?action=getCategories')
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
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
<<<<<<< HEAD
        fetch('../controllers/product_actions.php?action=getProducts')
=======
        fetch('product_actions.php?action=getProducts')
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
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
<<<<<<< HEAD
        if (productModal) {
            productModal.style.display = 'block';
            document.getElementById('modalTitle').textContent = 'Agregar Producto';
            productForm.reset();
            document.getElementById('productId').value = '';
        }
=======
        productModal.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Agregar Producto';
        productForm.reset();
        document.getElementById('productId').value = '';
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
    }

    // Abrir el modal de categoría
    function openCategoryModal() {
<<<<<<< HEAD
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
=======
        categoryModal.style.display = 'block';
    }

    // Cerrar el modal
    function closeModal() {
        this.closest('.modal').style.display = 'none';
    }

    // Manejar el envío del formulario de producto
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
    function handleProductFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(productForm);
        const productId = document.getElementById('productId').value;
        formData.append('action', productId ? 'editProduct' : 'saveProduct');

<<<<<<< HEAD
        fetch('../controllers/product_actions.php', {
=======
        fetch('product_actions.php', {
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showConfirmation(data.message);
                loadInventoryData();
<<<<<<< HEAD
                const closeBtn = productModal.querySelector('.close');
                if (closeBtn) closeModal(closeBtn);
=======
                closeModal.call(productModal.querySelector('.close'));
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
                productForm.reset();
            } else {
                showNotification('Error al guardar el producto: ' + data.message, 'error');
            }
        })
<<<<<<< HEAD
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al guardar el producto', 'error');
        });
    }

    // Envío del formulario de categoría
=======
        .catch(error => console.error('Error:', error));
    }

    // Función para mostrar confirmación
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
        closeBtn.onclick = function() {
            confirmationModal.style.display = 'none';
            confirmationModal.remove();
        }
    }

    // Manejar el envío del formulario de categoría
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
    function handleCategoryFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(categoryForm);
        formData.append('action', 'saveCategory');

<<<<<<< HEAD
        fetch('../controllers/category_actions.php', {
=======
        fetch('category_actions.php', {
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showConfirmation(data.message);
                loadCategories();
<<<<<<< HEAD
                const closeBtn = categoryModal.querySelector('.close');
                if (closeBtn) closeModal(closeBtn);
=======
                closeModal.call(categoryModal.querySelector('.close'));
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
                categoryForm.reset();
            } else {
                showNotification('Error al guardar la categoría: ' + data.message, 'error');
            }
        })
        .catch(error => console.error('Error:', error));
    }

<<<<<<< HEAD
    // Manejo de búsqueda y filtros
=======
    // Manejar la búsqueda
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
    function handleSearch() {
        handleFilters();
    }

<<<<<<< HEAD
    function handleFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const maxPrice = priceFilter ? parseFloat(priceFilter.value) || Infinity : Infinity;
=======
    // Manejar los filtros
    function handleFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const maxPrice = parseFloat(priceFilter.value) || Infinity;
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23

        const filteredData = inventoryData.filter(product => 
            product.nombre.toLowerCase().includes(searchTerm) &&
            (selectedCategory === '' || product.categoria == selectedCategory) &&
            product.precio <= maxPrice
        );
<<<<<<< HEAD
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
=======

        renderInventory(filteredData);
    }

    // Cambiar la vista (grid o list)
    function switchView(view) {
        inventoryGallery.className = `inventory-gallery ${view}-view`;
        gridViewBtn.classList.toggle('active', view === 'grid');
        listViewBtn.classList.toggle('active', view === 'list');
        renderInventory();
    }

    // Renderizar categorías
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
    function renderCategories() {
        const categoryOptions = categories.map(category => 
            `<option value="${category.id}">${category.nombre}</option>`
        ).join('');
<<<<<<< HEAD
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + categoryOptions;
        }
        const productCategorySelect = document.getElementById('productCategory');
        if (productCategorySelect) {
            productCategorySelect.innerHTML = categoryOptions;
        }
    }

    // Renderizar el inventario de productos
=======
        
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + categoryOptions;
        document.getElementById('productCategory').innerHTML = categoryOptions;
    }

    // Renderizar inventario
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
    function renderInventory(data = inventoryData) {
        inventoryGallery.innerHTML = '';
        if (data.length === 0) {
            inventoryGallery.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }
<<<<<<< HEAD
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
=======

        data.forEach(product => {
            const productElement = document.createElement('div');
            const baseUrl = '/Inventario';
           
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <img src="${product.imagen ? (product.imagen.startsWith('/') ? baseUrl + product.imagen : baseUrl + '/controllers/uploads/' + product.imagen) : baseUrl + '/public/uploads/default-product.png'}" alt="${product.nombre}">
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
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

<<<<<<< HEAD
    // Editar producto – precarga el formulario con los datos
    function editProduct(id) {
        fetch(`../controllers/product_actions.php?action=getProducts&id=${id}`)
=======
    // Editar producto
    function editProduct(id) {
        fetch(`product_actions.php?action=getProducts&id=${id}`)
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
            .then(response => response.json())
            .then(data => {
                if (data.success && data.products.length > 0) {
                    const product = data.products[0];
<<<<<<< HEAD
                    document.getElementById('productId').value = product.id || '';
=======
                    document.getElementById('productId').value = product.id;
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
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

<<<<<<< HEAD
    // Eliminar producto con confirmación
=======
    // Eliminar producto
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
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
<<<<<<< HEAD
            fetch(`../controllers/product_actions.php?action=deleteProduct&id=${id}`, {
=======
            fetch(`product_actions.php?action=deleteProduct&id=${id}`, {
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Producto eliminado exitosamente', 'success');
<<<<<<< HEAD
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
=======
                    modal.remove();
                }
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
            });
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            modal.remove();
        });
    }

<<<<<<< HEAD
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

=======
    // API pública
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
    return {
        init: init,
        loadInventory: loadInventoryData,
        editProduct: editProduct,
        deleteProduct: deleteProduct
    };
})();

// Inicializar la aplicación cuando el DOM esté listo
<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando InventoryApp');
    InventoryApp.init();
});
=======
document.addEventListener('DOMContentLoaded', InventoryApp.init);
>>>>>>> a649a3d102f0a7a3288ad0ae131b3c383517ab23
