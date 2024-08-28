document.addEventListener('DOMContentLoaded', () => {
    const addSaleBtn = document.getElementById('addSaleBtn');
    const saleModal = document.getElementById('saleModal');
    const closeSaleModal = saleModal.querySelector('.close');
    const saleForm = document.getElementById('saleForm');

    const addClientBtn = document.getElementById('addClientBtn');
    const clientModal = document.getElementById('clientModal');
    const closeClientModal = clientModal.querySelector('.close');
    const clientForm = document.getElementById('clientForm');

    addSaleBtn.addEventListener('click', () => {
        saleModal.style.display = 'flex';
        saleForm.reset();
        document.getElementById('modalTitle').textContent = 'Agregar Venta';
    });

    closeSaleModal.addEventListener('click', () => {
        saleModal.style.display = 'none';
    });

    addClientBtn.addEventListener('click', () => {
        clientModal.style.display = 'flex';
        clientForm.reset();
    });

    closeClientModal.addEventListener('click', () => {
        clientModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === saleModal) {
            saleModal.style.display = 'none';
        }
        if (event.target === clientModal) {
            clientModal.style.display = 'none';
        }
    });

    saleForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const saleData = {
            id: document.getElementById('saleId').value,
            product: document.getElementById('saleProduct').value,
            category: document.getElementById('saleCategory').value,
            client: document.getElementById('saleClient').value,
            date: document.getElementById('saleDate').value,
            price: document.getElementById('salePrice').value,
        };
    
        const sales = getLocalStorageData('sales');
        sales.push(saleData);
        setLocalStorageData('sales', sales);
        updateSalesTable();
        saleModal.style.display = 'none';
    });
    

    clientForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const clientData = {
            name: document.getElementById('clientName').value,
            phone: document.getElementById('clientPhone').value,
            country: document.getElementById('clientCountry').value,
        };
    
        const clients = getLocalStorageData('clients');
        clients.push(clientData);
        setLocalStorageData('clients', clients);
        updateClientOptions();
        clientModal.style.display = 'none';
    });
    //Funcion cargar clientes
    function updateClientOptions() {
        const clients = getLocalStorageData('clients');
        const saleClient = document.getElementById('saleClient');
        saleClient.innerHTML = '<option value="">Seleccionar Cliente</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.name;
            option.textContent = client.name;
            saleClient.appendChild(option);
        });
    }
    // FUNCION ACUALIZAR TABLA
    function updateSalesTable() {
        const sales = getLocalStorageData('sales');
        const salesTableBody = document.querySelector('.sales-table tbody');
        salesTableBody.innerHTML = '';
    
        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${sale.product}</td>
                <td>${sale.category}</td>
                <td>${sale.client}</td>
                <td>${sale.date}</td>
                <td>${sale.price}</td>
            `;
            salesTableBody.appendChild(row);
        });
    }
    

    // Función para cargar productos, categorías y clientes en los filtros y formularios
    function loadOptions() {
        const productFilter = document.getElementById('productFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const clientFilter = document.getElementById('clientFilter');
    
        const saleProduct = document.getElementById('saleProduct');
        const saleCategory = document.getElementById('saleCategory');
        const saleClient = document.getElementById('saleClient');
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.name;
            option.textContent = client.name;
            clientFilter.appendChild(option);
            saleClient.appendChild(option.cloneNode(true));
        });
    }
    
        
// Función para obtener datos de LocalStorage
function getLocalStorageData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Función para guardar datos en LocalStorage
function setLocalStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
            saleCategory.appendChild(option.cloneNode(true));
        });

        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client;
            option.textContent = client;
            clientFilter.appendChild(option);
            saleClient.appendChild(option.cloneNode(true));
        });
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const categoryModal = document.getElementById('categoryModal');
        const closeCategoryModal = categoryModal.querySelector('.close');
        const categoryForm = document.getElementById('categoryForm');
        
        addCategoryBtn.addEventListener('click', () => {
            categoryModal.style.display = 'flex';
            categoryForm.reset();
        });
        
        closeCategoryModal.addEventListener('click', () => {
            categoryModal.style.display = 'none';
        });
        
        categoryForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const categoryData = document.getElementById('categoryName').value;
        
            const categories = getLocalStorageData('categories');
            categories.push(categoryData);
            setLocalStorageData('categories', categories);
            loadOptions();
            categoryModal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === saleModal) {
                saleModal.style.display = 'none';
            }
            if (event.target === clientModal) {
                clientModal.style.display = 'none';
            }
            if (event.target === categoryModal) {
                categoryModal.style.display = 'none';
            }
        });
    
        // Inicializar la tabla de ventas
        updateSalesTable();
        updateClientOptions();
        loadOptions();
    });
    
    // Función para obtener datos de LocalStorage
    function getLocalStorageData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }
    
    // Función para guardar datos en LocalStorage
    function setLocalStorageData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    document.addEventListener('DOMContentLoaded', () => {
        const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
        const sidebar = document.getElementById('sidebar');
    
        // Ocultar la barra lateral por defecto
        sidebar.classList.add('collapsed');
    
        // Agregar evento de clic para alternar la barra lateral
        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    });
    