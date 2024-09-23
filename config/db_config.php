<?php
$host = 'localhost';
$db   = 'arte_y_cuero';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Registrar el error completo en un archivo de registro
    error_log("Error de conexión a la base de datos: " . $e->getMessage(), 3, "errores.log");

    // Mostrar un mensaje amigable al usuario
    die("Error al conectar con la base de datos. Por favor, contacta al administrador.");
}
?>
