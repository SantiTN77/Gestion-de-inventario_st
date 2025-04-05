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

function getCategories() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM categorias ORDER BY nombre");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'categories' => $categories]);
    } catch (Exception $e) {
        error_log('Error en getCategories: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error al obtener categorías: ' . $e->getMessage()]);
    }
}

function saveCategory() {
    global $pdo;
    try {
        $nombre = sanitizeInput($_POST['nombre']);
        $stmt = $pdo->prepare("INSERT INTO categorias (nombre) VALUES (?)");
        $stmt->execute([$nombre]);
        echo json_encode(['success' => true, 'message' => 'Categoría guardada correctamente']);
    } catch (Exception $e) {
        error_log('Error en saveCategory: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error al guardar categoría: ' . $e->getMessage()]);
    }
}

if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'getCategories':
            getCategories();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Acción inválida']);
    }
} else if (isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'saveCategory':
            saveCategory();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Acción inválida']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'No se especificó ninguna acción']);
}
?>
