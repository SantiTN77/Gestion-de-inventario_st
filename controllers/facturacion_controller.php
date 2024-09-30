<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../config/db_config.php';

function obtener_facturas($cliente_id = null, $fecha = null) {
    global $pdo;
    try {
        $sql = "SELECT f.*, c.nombre as nombre_cliente 
                FROM facturas f 
                JOIN clientes c ON f.cliente_id = c.id 
                WHERE 1=1";
        $params = [];

        if ($cliente_id) {
            $sql .= " AND f.cliente_id = ?";
            $params[] = $cliente_id;
        }
        if ($fecha) {
            $sql .= " AND DATE(f.fecha) = ?";
            $params[] = $fecha;
        }

        $sql .= " ORDER BY f.fecha DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Error al obtener facturas: ' . $e->getMessage()];
    }
}

function obtener_factura($id) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("SELECT f.*, c.nombre as nombre_cliente 
                               FROM facturas f 
                               JOIN clientes c ON f.cliente_id = c.id 
                               WHERE f.id = ?");
        $stmt->execute([$id]);
        $factura = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($factura) {
            // Obtener los productos de la factura
            $stmt = $pdo->prepare("SELECT df.*, p.nombre as nombre_producto 
                                   FROM facturas df 
                                   JOIN productos p ON df.producto_id = p.id 
                                   WHERE df.factura_id = ?");
            $stmt->execute([$id]);
            $factura['productos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return ['success' => true, 'data' => $factura];
        } else {
            return ['success' => false, 'message' => 'Factura no encontrada'];
        }
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Error al obtener factura: ' . $e->getMessage()];
    }
}

function guardar_factura($cliente_id, $fecha, $total, $productos) {
    global $pdo;
    try {
        $pdo->beginTransaction();

        // Insert into facturas table first
        $stmt = $pdo->prepare("INSERT INTO facturas (cliente_id, fecha, total) VALUES (?, ?, ?)");
        $stmt->execute([$cliente_id, $fecha, $total]);
        $factura_id = $pdo->lastInsertId(); // Get the new factura_id

        foreach ($productos as $producto) {
            // Now insert into detalle_facturas
            $stmt = $pdo->prepare("INSERT INTO detalle_facturas (factura_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
            $stmt->execute([$factura_id, $producto['id'], $producto['cantidad'], $producto['precio']]);

            // Update cantidad in productos table
            $stmt = $pdo->prepare("UPDATE productos SET cantidad = cantidad - ? WHERE id = ?");
            $stmt->execute([$producto['cantidad'], $producto['id']]);
        }

        $pdo->commit();
        return ['success' => true, 'message' => 'Factura guardada exitosamente', 'factura_id' => $factura_id];
    } catch (PDOException $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => 'Error al guardar la factura: ' . $e->getMessage()];
    }
}

function obtener_clientes() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM clientes");
        return ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Error al obtener clientes: ' . $e->getMessage()];
    }
}

function obtener_productos() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM productos");
        return ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Error al obtener productos: ' . $e->getMessage()];
    }
}

function eliminar_factura($id) {
    global $pdo;
    try {
        $pdo->beginTransaction();

        // Obtener los detalles de la factura para restaurar la cantidad
        $stmt = $pdo->prepare("SELECT producto_id, cantidad FROM detalle_facturas WHERE factura_id = ?");
        $stmt->execute([$id]);
        $detallesFactura = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Eliminar los detalles de la factura
        $stmt = $pdo->prepare("DELETE FROM detalle_facturas WHERE factura_id = ?");
        $stmt->execute([$id]);

        // Eliminar la factura
        $stmt = $pdo->prepare("DELETE FROM facturas WHERE id = ?");
        $stmt->execute([$id]);

        // Restaurar la cantidad de los productos
        foreach ($detallesFactura as $detalle) {
            $stmt = $pdo->prepare("UPDATE productos SET cantidad = cantidad + ? WHERE id = ?");
            $stmt->execute([$detalle['cantidad'], $detalle['producto_id']]);
        }

        $pdo->commit();
        return ['success' => true, 'message' => 'Factura eliminada correctamente'];
    } catch (PDOException $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => 'Error al eliminar la factura: ' . $e->getMessage()];
    }
}

// Manejador de solicitudes AJAX
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    header('Content-Type: application/json'); // Asegurarse de que la respuesta sea JSON

    switch ($action) {
        case 'obtener_facturas':
            $cliente_id = $_POST['cliente_id'] ?? null;
            $fecha = $_POST['fecha'] ?? null;
            echo json_encode(obtener_facturas($cliente_id, $fecha));
            break;
        case 'obtener_factura':
            $id = $_POST['id'] ?? 0;
            echo json_encode(obtener_factura($id));
            break;
        case 'guardar_factura':
            $cliente_id = $_POST['cliente_id'] ?? 0;
            $fecha = $_POST['fecha'] ?? '';
            $total = $_POST['total'] ?? 0;
            $productos = json_decode($_POST['productos'], true);
            if (!$cliente_id || !$fecha || !$total || !$productos) {
                echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
                break;
            }
            echo json_encode(guardar_factura($cliente_id, $fecha, $total, $productos));
            break;
        case 'obtener_clientes':
            echo json_encode(obtener_clientes());
            break;
        case 'obtener_productos':
            echo json_encode(obtener_productos());
            break;
        case 'eliminar_factura':
            $id = $_POST['id'] ?? 0;
            echo json_encode(eliminar_factura($id));
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no reconocida']);
    }
    exit;
}
?>