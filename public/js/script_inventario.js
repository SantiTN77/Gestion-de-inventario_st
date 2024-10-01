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
        cacheDOMElements();
        bindEvents();
        loadCategories();
        loadInventoryData();
    }

    function cacheDOMElements() {
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
    }

    function bindEvents() {
        if (addProductBtn) addProductBtn.addEventListener('click', openProductModal);
        if (addCategoryBtn) addCategoryBtn.addEventListener('click', openCategoryModal);
        closeButtons.forEach(button => button.addEventListener('click', closeModal));
        if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);
        if (categoryForm) categoryForm.addEventListener('submit', handleCategoryFormSubmit);
        if (searchInput) searchInput.addEventListener('input', handleSearch);
        if (categoryFilter) categoryFilter.addEventListener('change', handleFilters);
        if (priceFilter) priceFilter.addEventListener('input', handleFilters);
        if (gridViewBtn) gridViewBtn.addEventListener('click', () => switchView('grid'));
        if (listViewBtn) listViewBtn.addEventListener('click', () => switchView('list'));
    }

    // Cargar categorías
    function loadCategories() {
        fetch('category_actions.php?action=getCategories')
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
        fetch('product_actions.php?action=getProducts')
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
        productModal.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Agregar Producto';
        productForm.reset();
        document.getElementById('productId').value = '';
    }

    // Abrir el modal de categoría
    function openCategoryModal() {
        categoryModal.style.display = 'block';
    }

    // Cerrar el modal
    function closeModal() {
        this.closest('.modal').style.display = 'none';
    }

    // Manejar el envío del formulario de producto
    function handleProductFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(productForm);
        const productId = document.getElementById('productId').value;
        formData.append('action', productId ? 'editProduct' : 'saveProduct');

        fetch('product_actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showConfirmation(data.message);
                loadInventoryData();
                closeModal.call(productModal.querySelector('.close'));
                productForm.reset();
            } else {
                showNotification('Error al guardar el producto: ' + data.message, 'error');
            }
        })
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
    function handleCategoryFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(categoryForm);
        formData.append('action', 'saveCategory');

        fetch('category_actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showConfirmation(data.message);
                loadCategories();
                closeModal.call(categoryModal.querySelector('.close'));
                categoryForm.reset();
            } else {
                showNotification('Error al guardar la categoría: ' + data.message, 'error');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Manejar la búsqueda
    function handleSearch() {
        handleFilters();
    }

    // Manejar los filtros
    function handleFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const maxPrice = parseFloat(priceFilter.value) || Infinity;

        const filteredData = inventoryData.filter(product => 
            product.nombre.toLowerCase().includes(searchTerm) &&
            (selectedCategory === '' || product.categoria == selectedCategory) &&
            product.precio <= maxPrice
        );

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
    function renderCategories() {
        const categoryOptions = categories.map(category => 
            `<option value="${category.id}">${category.nombre}</option>`
        ).join('');
        
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + categoryOptions;
        document.getElementById('productCategory').innerHTML = categoryOptions;
    }

    // Renderizar inventario
    function renderInventory(data = inventoryData) {
        inventoryGallery.innerHTML = '';
        if (data.length === 0) {
            inventoryGallery.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        data.forEach(product => {
            const productElement = document.createElement('div');
            const baseUrl = '/Inventario';
           
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <img src="${product.imagen ? (product.imagen.startsWith('/') ? baseUrl + product.imagen : baseUrl + '/controllers/uploads/' + product.imagen) : baseUrl + '/public/uploads/default-product.png'}" alt="${product.nombre}">
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

    // Editar producto
    function editProduct(id) {
        fetch(`product_actions.php?action=getProducts&id=${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.products.length > 0) {
                    const product = data.products[0];
                    document.getElementById('productId').value = product.id;
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

    // Eliminar producto
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
            fetch(`product_actions.php?action=deleteProduct&id=${id}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Producto eliminado exitosamente', 'success');
                    modal.remove();
                }
            });
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            modal.remove();
        });
    }

    // API pública
    return {
        init: init,
        loadInventory: loadInventoryData,
        editProduct: editProduct,
        deleteProduct: deleteProduct
    };
})();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', InventoryApp.init);