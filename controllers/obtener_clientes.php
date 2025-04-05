<?php
// Archivo: obtener_clientes.php

// Incluir el archivo de configuración de la base de datos
require_once 'db_config.php';

// Consulta SQL para obtener los clientes
$sql = "SELECT nombre, telefono, pais FROM clientes";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$clients = $stmt->fetchAll();

// Devolver los datos en formato JSON
header('Content-Type: application/json');
echo json_encode($clients);
?>