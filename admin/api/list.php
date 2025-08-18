<?php
require __DIR__ . '/../_auth.php';
header('Content-Type: application/json; charset=utf-8');

$category = $_GET['category'] ?? '';
$q = mb_strtolower(trim($_GET['q'] ?? ''));

if (!isset(CATEGORY_JSON[$category])) { http_response_code(400); echo json_encode(['items'=>[]]); exit; }

$items = read_json(CATEGORY_JSON[$category]);
if ($q !== '') {
  $items = array_values(array_filter($items, function($p) use($q){
    return str_contains(mb_strtolower($p['title'] ?? ''), $q)
        || str_contains(mb_strtolower($p['code'] ?? ''),  $q);
  }));
}
echo json_encode(['items'=>$items], JSON_UNESCAPED_UNICODE);
