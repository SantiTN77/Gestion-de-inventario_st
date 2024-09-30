<?php
include_once('../config/db_config.php');
include_once('../controllers/functions.php');

// Asegurarse de que los errores PHP no se muestren en la salida
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '../logs/php_errors.log');

// Configurar el manejador de excepciones
set_exception_handler(function($e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Se produjo un error inesperado. Por favor, inténtelo de nuevo más tarde.']);
    exit;
});

$action = $_REQUEST['action'] ?? '';

switch ($action) {
    case 'saveProduct':
        saveProduct();
        break;
    case 'getProducts':
        getProducts();
        break;
    case 'editProduct':
        editProduct();
        break;
    case 'deleteProduct':
        deleteProduct();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function saveProduct() {
    global $pdo;
    try {
        $nombre = sanitizeInput($_POST['productName']);
        $categoria_id = sanitizeInput($_POST['productCategory']);
        $precio = sanitizeInput($_POST['productPrice']);
        $cantidad = sanitizeInput($_POST['productQuantity']);
        
        $target_file = null;
        if (isset($_FILES['productImage']) && $_FILES['productImage']['error'] == 0) {
            $target_dir = '../public/uploads/';
            $target_file = $target_dir . basename($_FILES['productImage']['name']);
            if (move_uploaded_file($_FILES['productImage']['tmp_name'], $target_file)) {
                $target_file = '/public/uploads/' . basename($_FILES['productImage']['name']); // Store relative path
            } else {
                throw new Exception('Error al subir la imagen');
            }
        }

        $stmt = $pdo->prepare("INSERT INTO productos (nombre, categoria_id, precio, cantidad, imagen) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $categoria_id, $precio, $cantidad, $target_file]);
        echo json_encode(['success' => true, 'message' => 'Producto guardado exitosamente', 'id' => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        error_log('Error en saveProduct: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error al guardar el producto: ' . $e->getMessage()]);
    }
}

function getProducts() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.nombre");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'products' => $products]);
    } catch (Exception $e) {
        error_log('Error en getProducts: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error al obtener productos: ' . $e->getMessage()]);
    }
}

function editProduct() {
    global $pdo;
    try {
        $id = sanitizeInput($_POST['productId']);
        $nombre = sanitizeInput($_POST['productName']);
        $categoria_id = sanitizeInput($_POST['productCategory']);
        $precio = sanitizeInput($_POST['productPrice']);
        $cantidad = sanitizeInput($_POST['productQuantity']);

        $target_file = null;
        if (isset($_FILES['productImage']) && $_FILES['productImage']['error'] == 0) {
            $target_dir = '../public/uploads/';
            $target_file = $target_dir . basename($_FILES['productImage']['name']);
            if (move_uploaded_file($_FILES['productImage']['tmp_name'], $target_file)) {
                $target_file = '/public/uploads/' . basename($_FILES['productImage']['name']); // Store relative path
            } else {
                throw new Exception('Error al subir la imagen');
            }
        }

        if ($target_file) {
            $stmt = $pdo->prepare("UPDATE productos SET nombre = ?, categoria_id = ?, precio = ?, cantidad = ?, imagen = ? WHERE id = ?");
            $stmt->execute([$nombre, $categoria_id, $precio, $cantidad, $target_file, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE productos SET nombre = ?, categoria_id = ?, precio = ?, cantidad = ? WHERE id = ?");
            $stmt->execute([$nombre, $categoria_id, $precio, $cantidad, $id]);
        }
        echo json_encode(['success' => true, 'message' => 'Producto actualizado exitosamente']);
    } catch (Exception $e) {
        error_log('Error en editProduct: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el producto: ' . $e->getMessage()]);
    }
}

function deleteProduct() {
    global $pdo;
    try {
        $id = sanitizeInput($_GET['id']);
        $stmt = $pdo->prepare("DELETE FROM productos WHERE id = ?");
        $result = $stmt->execute([$id]);
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Producto eliminado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se pudo eliminar el producto']);
        }
    } catch (Exception $e) {
        error_log('Error en deleteProduct: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el producto: ' . $e->getMessage()]);
    }
}