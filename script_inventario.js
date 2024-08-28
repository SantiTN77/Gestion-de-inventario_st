// Módulo de Inventario
const InventoryApp = (function() {
    // Variables privadas
    let inventoryData = [];
    let categories = [];
    let currentView = 'grid';
    let productModal, categoryModal, addProductBtn, addCategoryBtn, closeButtons, productForm, categoryForm, searchInput, categoryFilter, priceFilter, gridViewBtn, listViewBtn, inventoryGallery;

    // Función de inicialización
    function init() {
        cacheDOMElements();
        bindEvents();
        loadCategories();
        loadInventoryData();
    }

    // Cachear elementos del DOM
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

    // Vincular eventos
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
        categories = JSON.parse(localStorage.getItem('categories')) || [];
        renderCategories();
    }

    // Cargar datos de inventario
    function loadInventoryData() {
        inventoryData = JSON.parse(localStorage.getItem('inventory')) || [];
        renderInventory();
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
        const productId = document.getElementById('productId').value;
        const newProduct = {
            id: productId ? parseInt(productId) : Date.now(),
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            quantity: parseInt(document.getElementById('productQuantity').value) || 0,
            image: null
        };

        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                newProduct.image = event.target.result;
                addProductToInventory(newProduct);
            };
            reader.readAsDataURL(imageFile);
        } else {
            addProductToInventory(newProduct);
        }
    }

    function addProductToInventory(product) {
        const existingProductIndex = inventoryData.findIndex(p => p.id === product.id);
        if (existingProductIndex !== -1) {
            inventoryData[existingProductIndex] = product;
        } else {
            inventoryData.push(product);
        }
        saveInventoryData();
        renderInventory();
        closeModal.call(productModal.querySelector('.close'));
        productForm.reset();
    }

    // Manejar el envío del formulario de categoría
    function handleCategoryFormSubmit(e) {
        e.preventDefault();
        const newCategory = document.getElementById('categoryName').value;
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            saveCategories();
            renderCategories();
            closeModal.call(categoryModal.querySelector('.close'));
            categoryForm.reset();
        }
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
            product.name.toLowerCase().includes(searchTerm) &&
            (selectedCategory === '' || product.category === selectedCategory) &&
            product.price <= maxPrice
        );

        renderInventory(filteredData);
    }

    // Cambiar la vista (grid o list)
    function switchView(view) {
        currentView = view;
        inventoryGallery.className = `inventory-gallery ${view}-view`;
        gridViewBtn.classList.toggle('active', view === 'grid');
        listViewBtn.classList.toggle('active', view === 'list');
        renderInventory();
    }

    // Renderizar categorías
    function renderCategories() {
        const categoryOptions = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');
        
        categoryFilter.innerHTML = '<option value="">Todas</option>' + categoryOptions;
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
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <img src="${product.image || '/api/placeholder/200/200'}" alt="${product.name}" onerror="this.src='/api/placeholder/200/200'">
                <div class="product-info">
                    <h3>${product.name || 'Sin nombre'}</h3>
                    <p>Categoría: ${product.category || 'Sin categoría'}</p>
                    <p>Precio: $${(product.price || 0).toFixed(2)}</p>
                    <p>Cantidad: ${product.quantity || 0}</p>
                </div>
                <div class="product-actions">
                    <button onclick="InventoryApp.editProduct(${product.id})">Editar</button>
                    <button onclick="InventoryApp.deleteProduct(${product.id})">Eliminar</button>
                </div>
            `;
            inventoryGallery.appendChild(productElement);
        });
    }

    // Guardar datos de inventario
    function saveInventoryData() {
        localStorage.setItem('inventory', JSON.stringify(inventoryData));
    }

    // Guardar categorías
    function saveCategories() {
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    // Editar producto
    function editProduct(id) {
        const product = inventoryData.find(p => p.id === id);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productQuantity').value = product.quantity || '';
            document.getElementById('modalTitle').textContent = 'Editar Producto';
            openProductModal();
        }
    }

    // Eliminar producto
    function deleteProduct(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            inventoryData = inventoryData.filter(p => p.id !== id);
            saveInventoryData();
            renderInventory();
        }
    }

    // API pública
    return {
        init: init,
        editProduct: editProduct,
        deleteProduct: deleteProduct
    };
})();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', InventoryApp.init);