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
        addProductBtn.addEventListener('click', openProductModal);
        addCategoryBtn.addEventListener('click', openCategoryModal);
        closeButtons.forEach(button => button.addEventListener('click', closeModal));
        productForm.addEventListener('submit', handleProductFormSubmit);
        categoryForm.addEventListener('submit', handleCategoryFormSubmit);
        searchInput.addEventListener('input', handleSearch);
        categoryFilter.addEventListener('change', handleFilters);
        priceFilter.addEventListener('input', handleFilters);
        gridViewBtn.addEventListener('click', () => switchView('grid'));
        listViewBtn.addEventListener('click', () => switchView('list'));
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
                alert(data.message);
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
                alert(data.message);
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
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            fetch(`product_actions.php?action=deleteProduct&id=${id}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showConfirmation(data.message);
                    loadInventoryData();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error al eliminar producto:', error));
        }
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