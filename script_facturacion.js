// JavaScript para funcionalidad de la página de facturación

// Función para mostrar modal de crear/editar factura
function showModal(title, invoiceData) {
    const modal = document.getElementById('invoiceModal');
    const modalTitle = document.getElementById('modalTitle');
    const invoiceForm = document.getElementById('invoiceForm');

    modalTitle.textContent = title;

    // Lógica para prellenar el formulario si invoiceData está definido (para editar factura)
    if (invoiceData) {
        document.getElementById('invoiceId').value = invoiceData.id;
        document.getElementById('clientName').value = invoiceData.client;
        document.getElementById('invoiceDate').value = invoiceData.date;
        document.getElementById('products').value = invoiceData.products;
        document.getElementById('totalAmount').value = invoiceData.total;
    } else {
        // Limpiar el formulario si no se está editando
        invoiceForm.reset();
    }

    modal.style.display = 'block';
}

// Función para cerrar modal
function closeModal() {
    const modal = document.getElementById('invoiceModal');
    modal.style.display = 'none';
}

// Evento para abrir modal de creación de factura
document.getElementById('createInvoiceBtn').addEventListener('click', function() {
    showModal('Crear Factura');
});

// Evento para cerrar modal al hacer clic en X
document.querySelector('.close').addEventListener('click', function() {
    closeModal();
});

// Evento para cerrar modal al hacer clic fuera del modal
window.onclick = function(event) {
    const modal = document.getElementById('invoiceModal');
    if (event.target == modal) {
        closeModal();
    }
};

// Función para guardar factura (simulación)
document.getElementById('invoiceForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const invoiceId = document.getElementById('invoiceId').value;
    const clientName = document.getElementById('clientName').value;
    const invoiceDate = document.getElementById('invoiceDate').value;
    const products = document.getElementById('products').value;
    const totalAmount = document.getElementById('totalAmount').value;

    // Aquí podrías enviar los datos a tu backend o almacenarlos localmente (simulación)
    console.log('Datos de la factura:', {
        id: invoiceId,
        client: clientName,
        date: invoiceDate,
        products: products,
        total: totalAmount
    });

    // Cerrar modal después de guardar
    closeModal();
});

// Función para cargar dinámicamente las facturas (simulación)
function loadInvoices(clientFilter, dateFilter) {
    const invoiceList = document.getElementById('invoiceList');
    invoiceList.innerHTML = ''; // Limpiar lista antes de cargar nuevas facturas

    // Aquí deberías obtener las facturas desde tu backend o almacenamiento local (simulación)
    const invoices = [
        { id: 1, client: 'Cliente 1', date: '2024-07-01', products: 'Producto A, Producto B', total: 200 },
        { id: 2, client: 'Cliente 2', date: '2024-07-02', products: 'Producto C', total: 100 },
        { id: 3, client: 'Cliente 3', date: '2024-07-03', products: 'Producto D, Producto E', total: 300 },
        { id: 4, client: 'Cliente 1', date: '2024-07-04', products: 'Producto F', total: 50 }
    ];

    invoices.forEach(function(invoice) {
        // Crear elemento de factura
        const invoiceCard = document.createElement('div');
        invoiceCard.classList.add('invoice-card');

        // Contenido de la factura
        const invoiceContent = `
            <div class="invoice-info">
                <h3>${invoice.client}</h3>
                <p><strong>Fecha:</strong> ${invoice.date}</p>
                <p><strong>Productos:</strong> ${invoice.products}</p>
                <p><strong>Total:</strong> $${invoice.total}</p>
            </div>
            <div class="invoice-actions">
                <button class="btn btn-secondary" onclick="showModal('Editar Factura', ${JSON.stringify(invoice)})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
        `;

        invoiceCard.innerHTML = invoiceContent;
        invoiceList.appendChild(invoiceCard);
    });
}

// Cargar facturas al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadInvoices();
});
