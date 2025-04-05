console.log('script_facturacion.js cargado');

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Declarar loadInvoices fuera del evento DOMContentLoaded
let loadInvoices;

function deleteInvoice(id) {
    console.log('Función deleteInvoice llamada con id:', id);
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content confirmation-modal">
            <h2>Confirmar eliminación</h2>
            <p>¿Estás seguro de que quieres eliminar esta factura?</p>
            <div class="button-group">
                <button id="confirmDelete" class="btn btn-danger">Eliminar</button>
                <button id="cancelDelete" class="btn btn-secondary">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmDelete').addEventListener('click', () => {
        fetch('../controllers/facturacion_controller.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=eliminar_factura&id=${id}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Factura eliminada exitosamente', 'success');
                loadInvoices(); // Ahora loadInvoices está definida globalmente
            } else {
                showNotification('Error al eliminar la factura: ' + data.message, 'error');
            }
            modal.remove();
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al eliminar la factura', 'error');
            modal.remove();
        });
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
        modal.remove();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const createInvoiceBtn = document.getElementById('createInvoiceBtn');
    const invoiceModal = document.getElementById('invoiceModal');
    const closeModal = invoiceModal.querySelector('.close');
    const invoiceForm = document.getElementById('invoiceForm');
    const addProductBtn = document.getElementById('addProductBtn');
    const productList = document.getElementById('productList');
    const totalAmount = document.getElementById('totalAmount');
    const clientFilter = document.getElementById('clientFilter');
    const dateFilter = document.getElementById('dateFilter');
    const filterBtn = document.getElementById('filterBtn');

    // Definir loadInvoices dentro del evento DOMContentLoaded
    loadInvoices = function() {
        const clientId = clientFilter.value;
        const date = dateFilter.value;

        fetch('../controllers/facturacion_controller.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=obtener_facturas&cliente_id=${clientId}&fecha=${date}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const invoices = data.data;
                const tableBody = document.querySelector('#invoiceTable tbody');
                tableBody.innerHTML = '';
                invoices.forEach(invoice => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${invoice.id}</td>
                        <td>${invoice.nombre_cliente}</td>
                        <td>${invoice.fecha}</td>
                        <td>$${parseFloat(invoice.total).toFixed(2)}</td>
                        <td>
                            <button class="btn btn-secondary btn-view" data-id="${invoice.id}">Ver</button>
                            <button class="btn btn-edit" data-id="${invoice.id}">Editar</button>
                            <button class="btn btn-delete" data-id="${invoice.id}">Eliminar</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                // Agregar event listeners a los botones de acción
                document.querySelectorAll('.btn-view').forEach(btn => {
                    btn.addEventListener('click', () => viewInvoice(btn.dataset.id));
                });
                document.querySelectorAll('.btn-edit').forEach(btn => {
                    btn.addEventListener('click', () => editInvoice(btn.dataset.id));
                });
                document.querySelectorAll('.btn-delete').forEach(btn => {
                    btn.addEventListener('click', () => {
                        console.log('Botón eliminar clickeado para id:', btn.dataset.id);
                        deleteInvoice(btn.dataset.id);
                    });
                });
            } else {
                console.error('Error al cargar facturas:', data.message);
                showNotification('Error al cargar facturas: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al cargar facturas', 'error');
        });
    };

    // Asegúrate de que el modal no se muestre al cargar la página
    invoiceModal.style.display = 'none';

    createInvoiceBtn.addEventListener('click', () => {
        invoiceModal.style.display = 'block';
        invoiceForm.reset();
        document.getElementById('modalTitle').textContent = 'Crear Factura';
        loadClients();
        loadProducts();
    });

    closeModal.addEventListener('click', () => {
        invoiceModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === invoiceModal) {
            invoiceModal.style.display = 'none';
        }
    });

    addProductBtn.addEventListener('click', () => {
        addProductRow();
        console.log('Se ha presionado el botón "Agregar Producto"');
    });

    invoiceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(invoiceForm);
        formData.append('action', 'guardar_factura');
    
        const productos = [];
        document.querySelectorAll('.product-row').forEach(row => {
            productos.push({
                id: row.querySelector('.product-select').value,
                cantidad: row.querySelector('.product-quantity').value,
                precio: row.querySelector('.product-price').value
            });
        });
        formData.append('productos', JSON.stringify(productos));
    
        fetch('../controllers/facturacion_controller.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Factura guardada exitosamente', 'success');
                invoiceModal.style.display = 'none';
                invoiceForm.reset();
                loadInvoices();
            } else {
                showNotification('Error al guardar la factura: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al guardar la factura', 'error');
        });
    });
    filterBtn.addEventListener('click', loadInvoices);

    function loadClients() {
        fetch('../controllers/facturacion_controller.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=obtener_clientes'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const clients = data.data;
                const clientSelect = document.getElementById('clientName');
                clientSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.nombre;
                    clientSelect.appendChild(option);
                });

                // También actualizar el filtro de clientes
                clientFilter.innerHTML = '<option value="">Todos los clientes</option>';
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.nombre;
                    clientFilter.appendChild(option);
                });
            } else {
                console.error('Error al cargar clientes:', data.message);
                alert('Error al cargar clientes: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar clientes');
        });
    }

    function loadProducts() {
        fetch('../controllers/facturacion_controller.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=obtener_productos'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.productList = data.data;
                // Llamar a addProductRow() aquí para agregar la primera fila
                addProductRow(); 
            } else {
                // Mostrar un mensaje de error más informativo
                console.error('Error al cargar productos:', data.message);
                alert(`Error al cargar productos: ${data.message}. Por favor, inténtalo de nuevo más tarde.`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar productos. Por favor, inténtalo de nuevo más tarde.');
        });
    }
    
    // Mover addProductRow() fuera de loadProducts() para que sea reutilizable
    function addProductRow() {
        // ... (tu código actual de addProductRow()) ...
    }
    
    function addProductRow() {
        const row = document.createElement('div');
        row.classList.add('product-row');
        row.innerHTML = `
            <select class="product-select" required>
                <option value="">Seleccionar Producto</option>
                ${window.productList.map(product => `<option value="${product.id}" data-price="${product.precio}">${product.nombre}</option>`).join('')}
            </select>
            <input type="number" class="product-quantity" min="1" value="1" required>
            <input type="number" class="product-price" min="0" step="0.01" required>
            <button type="button" class="btn btn-remove">Eliminar</button>
        `;
        productList.appendChild(row);

        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
            updateTotal();
        });

        row.querySelector('.product-select').addEventListener('change', (event) => {
            const selectedOption = event.target.options[event.target.selectedIndex];
            const price = selectedOption.dataset.price;
            row.querySelector('.product-price').value = price;
            updateTotal();
        });

        row.querySelector('.product-quantity').addEventListener('input', updateTotal);
        row.querySelector('.product-price').addEventListener('input', updateTotal);
    }

    function updateTotal() {
        let total = 0;
        document.querySelectorAll('.product-row').forEach(row => {
            const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.product-price').value) || 0;
            total += quantity * price;
        });
        totalAmount.value = total.toFixed(2);
    }

    function viewInvoice(id) {
        fetch('../controllers/facturacion_controller.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=obtener_factura&id=${id}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const invoice = data.data;
                alert(`Factura #${invoice.id}\nCliente: ${invoice.nombre_cliente}\nFecha: ${invoice.fecha}\nTotal: $${parseFloat(invoice.total).toFixed(2)}`);
            } else {
                alert('Error al cargar la factura: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar la factura');
        });
    }

    function editInvoice(id) {
        fetch('../controllers/facturacion_controller.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=obtener_factura&id=${id}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const invoice = data.data;
                document.getElementById('modalTitle').textContent = 'Editar Factura';
                document.getElementById('clientName').value = invoice.cliente_id;
                document.getElementById('invoiceDate').value = invoice.fecha;
                productList.innerHTML = '';
                invoice.productos.forEach(producto => {
                    addProductRow();
                    const lastRow = productList.lastElementChild;
                    lastRow.querySelector('.product-select').value = producto.id;
                    lastRow.querySelector('.product-quantity').value = producto.cantidad;
                    lastRow.querySelector('.product-price').value = producto.precio_unitario;
                });
                updateTotal();
                invoiceModal.style.display = 'block';
            } else {
                alert('Error al cargar la factura: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar la factura');
        });
    }

    // Cargar facturas e inicializar la página
    loadInvoices();
    loadClients();
});