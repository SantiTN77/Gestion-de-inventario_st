(function() {
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const ventasTable = document.getElementById('tablaVentas');
    const addVentaForm = document.getElementById('formVenta');
    const addClienteForm = document.getElementById('formCliente');
    const addCategoriaForm = document.getElementById('formCategoria');
    const productosAgregadosTable = document.getElementById('productosAgregados').querySelector('tbody');
    const totalVentaElement = document.getElementById('totalVenta');
    let totalVenta = 0;
    const ventaModal = document.getElementById('ventaModal');
    const clienteModal = document.getElementById('clienteModal');
    const categoriaModal = document.getElementById('categoriaModal');
    let productosVenta = []; // Array para almacenar los productos de la venta

    // Botones para abrir modales
    const nuevaVentaBtn = document.getElementById('nuevaVentaBtn');
    const nuevoClienteBtn = document.getElementById('nuevoClienteBtn');
    const nuevaCategoriaBtn = document.getElementById('nuevaCategoriaBtn');

    // Función para abrir un modal
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
        }
    }
   document.getElementById('agregarProductoBtn').addEventListener('click', () => {
       const productoSelect = document.getElementById('producto');
       const cantidadInput = document.getElementById('cantidad');
   
       const productoId = parseInt(productoSelect.value, 10); // Convertir a número
       const productoNombre = productoSelect.options[productoSelect.selectedIndex].text;
       const precioUnitario = parseFloat(productoSelect.options[productoSelect.selectedIndex].dataset.precio);
       const cantidad = parseInt(cantidadInput.value, 10);
       const cantidadDisponible = parseInt(productoSelect.options[productoSelect.selectedIndex].dataset.cantidad, 10);
   
       if (!productoId || cantidad <= 0) {
           showNotification('Seleccione un producto y una cantidad válida.', 'error');
           return;
       }
   
       if (cantidad > cantidadDisponible) {
           showNotification('No hay suficiente cantidad disponible.', 'error');
           return; 
       }
   
       // Buscar si el producto ya está en el array
       const productoExistente = productosVenta.find(p => p.id === productoId);
   
       if (productoExistente) {
           // Si el producto ya existe, actualizar la cantidad
           productoExistente.cantidad += cantidad;
       } else {
           // Si el producto no existe, agregarlo al array
           productosVenta.push({
               id: productoId,
               nombre: productoNombre,
               precio: precioUnitario,
               cantidad: cantidad
           });
       }
   
       actualizarTablaProductos();
       actualizarTotalVenta();
   });
   

   function actualizarTablaProductos() {
       productosAgregadosTable.innerHTML = ''; // Limpiar la tabla
   
       productosVenta.forEach(producto => {
           const row = document.createElement('tr');
           row.innerHTML = `
               <td>${producto.nombre}</td>
               <td>${producto.cantidad}</td>
               <td>$${producto.precio.toFixed(2)}</td>
               <td>$${(producto.precio * producto.cantidad).toFixed(2)}</td>
           `;
           productosAgregadosTable.appendChild(row);
       });
   }
   
   function actualizarTotalVenta() {
       totalVenta = productosVenta.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
       totalVentaElement.textContent = totalVenta.toFixed(2);
   }
   

    // Función para cerrar un modal
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Asociar eventos a los botones para abrir modales
    if (nuevaVentaBtn) nuevaVentaBtn.addEventListener('click', () => openModal(ventaModal));
    if (nuevoClienteBtn) nuevoClienteBtn.addEventListener('click', () => openModal(clienteModal));
    if (nuevaCategoriaBtn) nuevaCategoriaBtn.addEventListener('click', () => openModal(categoriaModal));
   
    // Cerrar modales al hacer clic en la "x"
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => closeModal(closeBtn.closest('.modal')));
    });
   
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    async function guardarVenta(event) {
        event.preventDefault();
        const clienteId = document.getElementById('cliente').value;
        const producto = document.getElementById('producto');
        const productoId = producto.value;
        const cantidad = document.getElementById('cantidad').value;
        const precioUnitario = parseFloat(producto.options[producto.selectedIndex].dataset.precio);
        const cantidadDisponible = parseInt(producto.options[producto.selectedIndex].dataset.cantidad, 10);

        if (cantidad > cantidadDisponible) {
            showNotification('No hay suficiente cantidad disponible.', 'error');
            return; 
        }
    
        try {
            const result = await fetchData('guardar_venta', { 
                cliente_id: clienteId,
                productos: JSON.stringify([{
                    id: productoId,
                    cantidad: cantidad,
                    precio: precioUnitario
                }])
            });

            if (result.success) {
                console.log('Venta guardada con éxito:', result.data);
                addVentaForm.reset();
                closeModal(ventaModal);
                productosVenta = []; // Limpiar el array después de guardar la venta
            actualizarTablaProductos(); // Limpiar la tabla
            actualizarTotalVenta(); // Reiniciar el total
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

    async function guardarCliente(event) {
        event.preventDefault();
        const nombre = document.getElementById('nombreCliente').value;
        const telefono = document.getElementById('telefonoCliente').value;
        const correo = document.getElementById('correoCliente').value;

        try {
            const result = await fetchData('guardar_cliente', { 
                nombre: nombre, 
                telefono: telefono, 
                correo: correo 
            });

            if (result.success) {
                console.log('Cliente guardado con éxito:', result.data);
                addClienteForm.reset();
                closeModal(clienteModal);
                loadClientes();
                showNotification('Cliente guardado exitosamente', 'success');
            } else {
                showNotification('Error al guardar el cliente: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error en la solicitud AJAX:', error);
            showNotification('Error al guardar el cliente: ' + error.message, 'error'); 
        }
    }

    async function guardarCategoria(event) {
        event.preventDefault();
        const nombre = document.getElementById('nombreCategoria').value;

        try {
            const result = await fetchData('guardar_categoria', { 
                nombre: nombre
            });

            if (result.success) {
                console.log('Categoría guardada con éxito:', result.data);
                addCategoriaForm.reset();
                closeModal(categoriaModal);
                loadCategorias(); // Aquí se llama a la función para recargar las categorías
                showNotification('Categoría guardada exitosamente', 'success');
            } else {
                showNotification('Error al guardar la categoría: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error en la solicitud AJAX:', error);
            showNotification('Error al guardar la categoría: ' + error.message, 'error'); 
        }
    }

    async function fetchData(action, data = {}) {
        const url = '../controllers/ventas_controller.php';
        const formData = new FormData();
        formData.append('action', action);

        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value);
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async function loadVentas() {
        try {
            const ventas = await fetchData('obtener_ventas');
            if (ventasTable) {
                ventasTable.innerHTML = '';
                ventas.forEach(venta => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${venta.id}</td>
                        <td>${venta.cliente_nombre}</td>
                        <td>${venta.fecha_venta}</td>
                        <td>${venta.total}</td>
                        <td>
                            <button class="btn btn-sm btn-info ver-detalles" data-id="${venta.id}">Ver detalles</button>
                        </td>
                    `;
                    ventasTable.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error al cargar ventas:', error);
        }
    }

    async function loadClientes() {
        try {
            const clientes = await fetchData('obtener_clientes');
            const clienteSelect = document.getElementById('cliente');
            if (clienteSelect) {
                clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.id;
                    option.textContent = cliente.nombre;
                    clienteSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    }

    async function loadProductos() {
        try {
            const productos = await fetchData('obtener_productos');
            const productoSelect = document.getElementById('producto');
            if (productoSelect) {
                productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';
                productos.forEach(producto => {
                    const option = document.createElement('option');
                    option.value = producto.id;
                    option.textContent = `${producto.nombre} - $${producto.precio}`;
                    option.dataset.precio = producto.precio;
                    option.dataset.cantidad = producto.stock;
                    productoSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    async function loadCategorias() {
        try {
            const categorias = await fetchData('obtener_categorias');
            // Aquí puedes actualizar el DOM para mostrar las categorías
        } catch (error) {
            console.error('Error al cargar categorías:', error);
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

    // Event Listeners
    if (addVentaForm) addVentaForm.addEventListener('submit', guardarVenta);
    if (addClienteForm) addClienteForm.addEventListener('submit', guardarCliente);
    if (addCategoriaForm) addCategoriaForm.addEventListener('submit', guardarCategoria);

    // Inicializar la página
    loadVentas();
    loadClientes();
    loadProductos();
});
})();
