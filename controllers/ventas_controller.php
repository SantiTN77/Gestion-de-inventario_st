<?php
require_once '../config/db_config.php';
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    $stmt = $pdo->query("SELECT v.*, c.nombre as cliente_nombre FROM ventas v LEFT JOIN clientes c ON v.cliente_id = c.id ORDER BY v.fecha_venta DESC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
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

// Manejador de solicitudes AJAX
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'obtener_categorias':
            echo json_encode(obtener_categorias());
            break;
        case 'obtener_clientes':
            echo json_encode(obtener_clientes());
            break;
        case 'obtener_productos':
            echo json_encode(obtener_productos());
            break;
        case 'obtener_ventas':
            echo json_encode(obtener_ventas());
            break;
        case 'guardar_venta':
            $cliente_id = $_POST['cliente_id'] ?? '';
            $productos = json_decode($_POST['productos'] ?? '[]', true);
            echo json_encode(guardar_venta($cliente_id, $productos));
            break;
        case 'guardar_cliente':
            $nombre = $_POST['nombre'] ?? '';
            $telefono = $_POST['telefono'] ?? '';
            $correo = $_POST['correo'] ?? '';
            echo json_encode(guardar_cliente($nombre, $telefono, $correo));
            break;
        case 'guardar_categoria':
            $nombre = $_POST['nombre'] ?? '';
            echo json_encode(guardar_categoria($nombre));
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no reconocida']);
    }
    exit;
}