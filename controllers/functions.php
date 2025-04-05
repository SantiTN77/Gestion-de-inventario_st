<?php
include_once('../config/db_config.php');


function getCategoryOptions() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM categorias ORDER BY nombre");
        $options = '';
        while ($row = $stmt->fetch()) {
            $options .= "<option value='{$row['id']}'>" . htmlspecialchars($row['nombre']) . "</option>";
        }
        return $options;
    } catch (PDOException $e) {
        error_log('Error getting category options: ' . $e->getMessage());
        return '';
    }
}

function sanitizeInput($input) {
    return htmlspecialchars(strip_tags($input), ENT_QUOTES, 'UTF-8');
}