// Funciones globales
async function fetchData(action, data = {}) {
    const formData = new FormData();
    formData.append('action', action);
    for (const key in data) {
        formData.append(key, data[key]);
    }

    try {
        const response = await fetch('../controllers/ventas_controller.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new TypeError("La respuesta no es JSON válido");
        }

        const jsonResponse = await response.json();
        console.log('Respuesta del servidor para ' + action + ':', jsonResponse); // Añadir este log
        return jsonResponse;
    } catch (error) {
        console.error('Error en fetchData:', error);
        throw error;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function editarVenta(id) {
    console.log('Editando venta:', id);
    // Implementar lógica de edición
}

// Declarar loadVentas en el ámbito global
let loadVentas;

function eliminarVenta(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
        fetchData('eliminar_venta', { id: id })
            .then(response => {
                console.log('Respuesta del servidor:', response);
                if (response.success) {
                    showNotification('Venta eliminada con éxito', 'success');
                    if (typeof loadVentas === 'function') {
                        loadVentas();
                    } else {
                        console.error('loadVentas no es una función');
                        // Alternativa: recargar la página
                        // window.location.reload();
                    }
                } else {
                    showNotification('Error al eliminar la venta: ' + (response.message || 'Error desconocido'), 'error');
                }
            })
            .catch(error => {
                console.error('Error al eliminar la venta:', error);
                showNotification('Error al eliminar la venta: ' + error.message, 'error');
            });
    }
}

function formatearFecha(fechaString) {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString();
}

// IIFE principal
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        // Elementos del DOM
        const ventasTable = document.getElementById('tablaVentas');
        const addVentaForm = document.getElementById('formVenta');
        const productList = document.getElementById('productList');
        const totalVentaInput = document.getElementById('totalVenta');
        const ventaModal = document.getElementById('ventaModal');
        const nuevaVentaBtn = document.getElementById('nuevaVentaBtn');
        const agregarProductoBtn = document.getElementById('agregarProductoBtn');

        // Funciones principales
        // Definir loadVentas dentro del ámbito de la IIFE
        loadVentas = async function() {
            try {
                const ventas = await fetchData('obtener_ventas');
                if (Array.isArray(ventas)) {
                    if (ventasTable) {
                        ventasTable.innerHTML = '';
                        ventas.forEach(venta => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${venta.id}</td>
                                <td>${venta.cliente_nombre}</td>
                                <td>${formatearFecha(venta.fecha_venta)}</td>
                                <td>$${parseFloat(venta.total).toFixed(2)}</td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="editarVenta(${venta.id})">Editar</button>
                                    <button class="btn btn-danger btn-sm" onclick="eliminarVenta(${venta.id})">Eliminar</button>
                                </td>
                            `;
                            ventasTable.appendChild(row);
                        });
                    }
                } else {
                    console.error('Respuesta inesperada:', ventas);
                    showNotification('Error al cargar las ventas', 'error');
                }
            } catch (error) {
                console.error('Error al cargar ventas:', error);
                showNotification('Error al cargar las ventas', 'error');
            }
        };

        async function guardarVenta(event) {
            event.preventDefault();
            const clienteId = document.getElementById('cliente').value;
            const productosVenta = [];

            document.querySelectorAll('.product-row').forEach(fila => {
                const productoId = fila.querySelector('.product-select').value;
                const cantidad = fila.querySelector('.product-quantity').value;
                const precio = fila.querySelector('.product-price').value;

                if (productoId && cantidad) {
                    productosVenta.push({
                        id: productoId,
                        cantidad: parseInt(cantidad),
                        precio: parseFloat(precio)
                    });
                }
            });

            if (productosVenta.length === 0) {
                showNotification('Agregue al menos un producto a la venta.', 'error');
                return;
            }

            try {
                const result = await fetchData('guardar_venta', { 
                    cliente_id: clienteId,
                    productos: JSON.stringify(productosVenta)
                });

                if (result.success) {
                    console.log('Venta guardada con éxito');
                    addVentaForm.reset();
                    closeModal(ventaModal);
                    productList.innerHTML = '';
                    loadVentas();
                    showNotification('Venta guardada exitosamente', 'success');
                } else {
                    showNotification('Error al guardar la venta: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Error en la solicitud AJAX:', error);
                showNotification('Error al guardar la venta: ' + error.message, 'error'); 
            }
        }

        function agregarProductoFila() {
            const fila = document.createElement('div');
            fila.classList.add('product-row');
            fila.innerHTML = `
                <select class="product-select" required>
                    <option value="">Seleccionar Producto</option>
                    ${window.productosList.map(producto => `<option value="${producto.id}" data-precio="${producto.precio}" data-cantidad="${producto.cantidad}">${producto.nombre}</option>`).join('')}
                </select>
                <input type="number" class="product-quantity" min="1" value="1" required>
                <input type="number" class="product-price" readonly>
                <button type="button" class="btn-remove">Eliminar</button>
            `;
            productList.appendChild(fila);

            const productoSelect = fila.querySelector('.product-select');
            const cantidadInput = fila.querySelector('.product-quantity');
            const precioInput = fila.querySelector('.product-price');
            const btnEliminar = fila.querySelector('.btn-remove');

            productoSelect.addEventListener('change', actualizarPrecio);
            cantidadInput.addEventListener('input', actualizarSubtotal);
            btnEliminar.addEventListener('click', () => {
                fila.remove();
                actualizarTotalVenta();
            });

            actualizarPrecio.call(productoSelect);
        }

        function actualizarPrecio() {
            const fila = this.closest('.product-row');
            const cantidadInput = fila.querySelector('.product-quantity');
            const precioInput = fila.querySelector('.product-price');
            const opcionSeleccionada = this.options[this.selectedIndex];

            if (opcionSeleccionada.value) {
                const precio = parseFloat(opcionSeleccionada.dataset.precio);
                const cantidadDisponible = parseInt(opcionSeleccionada.dataset.cantidad);
                
                precioInput.value = precio.toFixed(2);
                cantidadInput.max = cantidadDisponible;
                
                if (parseInt(cantidadInput.value) > cantidadDisponible) {
                    cantidadInput.value = cantidadDisponible;
                }
            } else {
                precioInput.value = '';
                cantidadInput.max = '';
            }

            actualizarSubtotal.call(cantidadInput);
        }

        function actualizarSubtotal() {
            actualizarTotalVenta();
        }

        function actualizarTotalVenta() {
            let total = 0;
            document.querySelectorAll('.product-row').forEach(fila => {
                const cantidad = parseInt(fila.querySelector('.product-quantity').value);
                const precio = parseFloat(fila.querySelector('.product-price').value);
                if (!isNaN(cantidad) && !isNaN(precio)) {
                    total += cantidad * precio;
                }
            });
            totalVentaInput.value = total.toFixed(2);
        }

        // Event Listeners
        if (addVentaForm) addVentaForm.addEventListener('submit', guardarVenta);
        if (nuevaVentaBtn) nuevaVentaBtn.addEventListener('click', () => {
            openModal(ventaModal);
            productList.innerHTML = '';
            agregarProductoFila();
        });
        if (agregarProductoBtn) agregarProductoBtn.addEventListener('click', agregarProductoFila);

        // Inicializar la página
        loadVentas();
        loadClientes();
        loadProductos();

        const filtroCliente = document.getElementById('filtroCliente');
        const filtroCategoria = document.getElementById('filtroCategoria');
        const filtroFechaDesde = document.getElementById('filtroFechaDesde');
        const filtroFechaHasta = document.getElementById('filtroFechaHasta');
        const btnFiltrar = document.getElementById('btnFiltrar');

        btnFiltrar.addEventListener('click', aplicarFiltros);

        async function aplicarFiltros() {
            const filtros = {
                cliente_id: filtroCliente.value,
                categoria_id: filtroCategoria.value,
                fecha_desde: filtroFechaDesde.value,
                fecha_hasta: filtroFechaHasta.value
            };

            try {
                const ventasFiltradas = await fetchData('obtener_ventas_filtradas', filtros);
                if (Array.isArray(ventasFiltradas)) {
                    actualizarTablaVentas(ventasFiltradas);
                } else if (typeof ventasFiltradas === 'object' && ventasFiltradas !== null) {
                    if (ventasFiltradas.error) {
                        showNotification('Error al aplicar filtros: ' + ventasFiltradas.error, 'error');
                    } else {
                        actualizarTablaVentas([]); // Si no hay resultados, mostrar tabla vacía
                        showNotification('No se encontraron ventas con los filtros aplicados', 'info');
                    }
                } else {
                    console.error('Respuesta inesperada:', ventasFiltradas);
                    showNotification('Error al aplicar filtros', 'error');
                }
            } catch (error) {
                console.error('Error al aplicar filtros:', error);
                showNotification('Error al aplicar filtros', 'error');
            }
        }

        function actualizarTablaVentas(ventas) {
            if (ventasTable) {
                ventasTable.innerHTML = '';
                ventas.forEach(venta => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${venta.id}</td>
                        <td>${venta.cliente_nombre}</td>
                        <td>${formatearFecha(venta.fecha_venta)}</td>
                        <td>$${parseFloat(venta.total).toFixed(2)}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="editarVenta(${venta.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarVenta(${venta.id})">Eliminar</button>
                        </td>
                    `;
                    ventasTable.appendChild(row);
                });
            }
        }
    });

    // Funciones auxiliares
    async function loadClientes() {
        try {
            const clientes = await fetchData('obtener_clientes');
            const clienteSelect = document.getElementById('cliente');
            const filtroCliente = document.getElementById('filtroCliente');
            
            if (clienteSelect) {
                clienteSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.id;
                    option.textContent = cliente.nombre;
                    clienteSelect.appendChild(option);
                });
            }
            
            if (filtroCliente) {
                filtroCliente.innerHTML = '<option value="">Todos los clientes</option>';
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.id;
                    option.textContent = cliente.nombre;
                    filtroCliente.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            showNotification('Error al cargar clientes', 'error');
        }
    }

    async function loadProductos() {
        try {
            const productos = await fetchData('obtener_productos');
            window.productosList = productos;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            showNotification('Error al cargar productos', 'error');
        }
    }

    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }
})();