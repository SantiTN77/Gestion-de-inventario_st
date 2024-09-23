<?php
// Archivo: guardar_tipo_producto.php

// Incluir el archivo de configuración de la base de datos
require_once 'db_config.php';

// Obtener el nombre del tipo de producto desde la solicitud
$categoryName = $_POST['nombre'];

// Preparar la consulta SQL
$sql = "INSERT INTO tipos_producto (nombre) VALUES (:nombre)";
$stmt = $pdo->prepare($sql);

// Vincular los parámetros de la consulta
$stmt->bindParam(':nombre', $categoryName);

// Ejecutar la consulta
$stmt->execute();

// Devolver una respuesta
echo "Tipo de producto guardado correctamente";
