<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

require_once '../config/db_config.php';

function obtener_categorias() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM categorias_ventas ORDER BY nombre");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function obtener_clientes() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM clientes ORDER BY nombre");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function obtener_productos() {
    global $pdo;
    $stmt = $pdo->query("SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.nombre");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function obtener_ventas() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT v.*, c.nombre as cliente_nombre FROM ventas v LEFT JOIN clientes c ON v.cliente_id = c.id ORDER BY v.fecha_venta DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => 'Error al obtener ventas: ' . $e->getMessage()];
    }
}

function guardar_venta($cliente_id, $productos) {
    global $pdo;
    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO ventas (cliente_id, fecha_venta, total) VALUES (?, NOW(), 0)");
        $stmt->execute([$cliente_id]);
        $venta_id = $pdo->lastInsertId();

        $total_venta = 0;


// Actualizar la cantidad del producto
$stmt = $pdo->prepare("UPDATE productos SET cantidad = cantidad - :cantidad WHERE id = :productoId");
$stmt->bindParam(':cantidad', $cantidad, PDO::PARAM_INT);
$stmt->bindParam(':productoId', $productoId, PDO::PARAM_INT);
$stmt->execute();


        foreach ($productos as $producto) {
            $stmt = $pdo->prepare("INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)");
            $subtotal = $producto['cantidad'] * $producto['precio'];
            $stmt->execute([$venta_id, $producto['id'], $producto['cantidad'], $producto['precio'], $subtotal]);

            $stmt = $pdo->prepare("UPDATE productos SET cantidad = cantidad - ? WHERE id = ?");
            $stmt->execute([$producto['cantidad'], $producto['id']]);

            $total_venta += $subtotal;
        }

        $stmt = $pdo->prepare("UPDATE ventas SET total = ? WHERE id = ?");
        $stmt->execute([$total_venta, $venta_id]);

        $pdo->commit();
        return ['success' => true, 'message' => 'Venta guardada correctamente'];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => 'Error al guardar la venta: ' . $e->getMessage()];
    }
}

function guardar_cliente($nombre, $telefono, $correo) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)");
        $stmt->execute([$nombre, $telefono, $correo]);
        return ['success' => true, 'message' => 'Cliente guardado correctamente'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Error al guardar el cliente: ' . $e->getMessage()];
    }
}

function guardar_categoria($nombre) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("INSERT INTO categorias_ventas (nombre) VALUES (?)");
        $stmt->execute([$nombre]);
        return ['success' => true, 'message' => 'Categoría guardada correctamente'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Error al guardar la categoría: ' . $e->getMessage()];
    }
}

function obtener_ventas_filtradas($filtros) {
    global $pdo;
    
    $sql = "SELECT v.*, c.nombre as cliente_nombre FROM ventas v 
            JOIN clientes c ON v.cliente_id = c.id
            WHERE 1=1";
    $params = [];

    if (!empty($filtros['cliente_id'])) {
        $sql .= " AND v.cliente_id = ?";
        $params[] = $filtros['cliente_id'];
    }

    if (!empty($filtros['categoria_id'])) {
        $sql .= " AND v.id IN (SELECT DISTINCT venta_id FROM detalles_venta dv 
                  JOIN productos p ON dv.producto_id = p.id 
                  WHERE p.categoria_id = ?)";
        $params[] = $filtros['categoria_id'];
    }

    if (!empty($filtros['fecha_desde'])) {
        $sql .= " AND v.fecha_venta >= ?";
        $params[] = $filtros['fecha_desde'];
    }

    if (!empty($filtros['fecha_hasta'])) {
        $sql .= " AND v.fecha_venta <= ?";
        $params[] = $filtros['fecha_hasta'] . ' 23:59:59';
    }

    $sql .= " ORDER BY v.fecha_venta DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => 'Error al filtrar ventas: ' . $e->getMessage()];
    }
}

function eliminar_venta($id) {
    global $pdo;
    try {
        $pdo->beginTransaction();

        // Primero, eliminamos los detalles de la venta
        $stmt = $pdo->prepare("DELETE FROM detalles_venta WHERE venta_id = ?");
        $stmt->execute([$id]);

        // Luego, eliminamos la venta
        $stmt = $pdo->prepare("DELETE FROM ventas WHERE id = ?");
        $stmt->execute([$id]);

        $pdo->commit();
        return ['success' => true, 'message' => 'Venta eliminada correctamente'];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => 'Error al eliminar la venta: ' . $e->getMessage()];
    }
}

// Manejador de solicitudes AJAX
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    $response = ['success' => false, 'message' => 'Acción no reconocida'];

    switch ($action) {
        case 'obtener_ventas':
            $response = obtener_ventas();
            break;
        case 'obtener_clientes':
            $response = obtener_clientes();
            break;
        case 'obtener_productos':
            $response = obtener_productos();
            break;
        case 'guardar_venta':
            $cliente_id = $_POST['cliente_id'] ?? '';
            $productos = json_decode($_POST['productos'] ?? '[]', true);
            $response = guardar_venta($cliente_id, $productos);
            break;
        case 'obtener_ventas_filtradas':
            $filtros = [
                'cliente_id' => $_POST['cliente_id'] ?? '',
                'categoria_id' => $_POST['categoria_id'] ?? '',
                'fecha_desde' => $_POST['fecha_desde'] ?? '',
                'fecha_hasta' => $_POST['fecha_hasta'] ?? ''
            ];
            $response = obtener_ventas_filtradas($filtros);
            break;
        case 'eliminar_venta':
            $id = $_POST['id'] ?? '';
            $response = eliminar_venta($id);
            break;
        // ... (otros casos) ...
    }

    echo json_encode($response);
    exit;
}