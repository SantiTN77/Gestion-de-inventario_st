<?php
// Archivo: obtener_tipos_producto.php

// Incluir el archivo de configuración de la base de datos
require_once 'db_config.php';

// Consulta SQL para obtener los tipos de producto
$sql = "SELECT nombre FROM tipos_producto";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$categories = $stmt->fetchAll();

// Devolver los datos en formato JSON
header('Content-Type: application/json');
echo json_encode($categories);
?>
