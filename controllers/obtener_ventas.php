<?php
// Archivo: obtener_ventas.php

// Incluir el archivo de configuración de la base de datos
require_once 'db_config.php';

// Obtener los filtros de la URL
$categoryFilter = isset($_GET['category']) ? $_GET['category'] : '';
$clientFilter = isset($_GET['client']) ? $_GET['client'] : '';
$productFilter = isset($_GET['product']) ? $_GET['product'] : '';

// Construir la consulta SQL
$sql = "SELECT id, producto, tipo_producto, cliente, precio, fecha FROM ventas";
$conditions = [];

if (!empty($categoryFilter)) {
    $conditions[] = "tipo_producto = :category";
}

if (!empty($clientFilter)) {
    $conditions[] = "cliente = :client";
}

if (!empty($productFilter)) {
    $conditions[] = "producto LIKE :product";
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(' AND ', $conditions);
}

$stmt = $pdo->prepare($sql);

// Vincular los parámetros de la consulta
if (!empty($categoryFilter)) {
    $stmt->bindValue(':category', $categoryFilter);
}

if (!empty($clientFilter)) {
    $stmt->bindValue(':client', $clientFilter);
}

if (!empty($productFilter)) {
    $stmt->bindValue(':product', '%' . $productFilter . '%');
}

// Ejecutar la consulta
$stmt->execute();
$sales = $stmt->fetchAll();

// Devolver los datos en formato JSON
header('Content-Type: application/json');
echo json_encode($sales);
?>