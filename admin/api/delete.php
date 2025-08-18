<?php
require __DIR__ . '/../_auth.php';
if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) { http_response_code(400); exit('CSRF'); }

$category = $_POST['category'] ?? '';
$code = trim($_POST['code'] ?? '');
if (!$code || !isset(CATEGORY_JSON[$category])) { http_response_code(400); exit('Datos inválidos'); }

$file = CATEGORY_JSON[$category];
$items = read_json($file);
$items = array_values(array_filter($items, fn($p)=> ($p['code'] ?? '') !== $code));

if (!write_json($file, $items)) { http_response_code(500); exit('No se pudo escribir JSON'); }
echo 'ok';
