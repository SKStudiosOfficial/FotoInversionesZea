<?php
require __DIR__ . '/../_auth.php';
if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) { http_response_code(400); exit('CSRF'); }

$category = trim($_POST['category'] ?? '');
$code = trim($_POST['code'] ?? '');
$title = trim($_POST['title'] ?? '');
$brand = trim($_POST['brand'] ?? '');
$condition = trim($_POST['condition'] ?? 'Nuevo');
$featuresTxt = trim($_POST['features'] ?? '');
$image_url = trim($_POST['image_url'] ?? '');
$id = trim($_POST['id'] ?? ''); // si viene, edita

if (!$category || !$code || !$title) { http_response_code(422); exit('Faltan campos'); }
if (!isset(CATEGORY_JSON[$category])) { http_response_code(400); exit('Categoría inválida'); }

// Lee JSON
$file = CATEGORY_JSON[$category];
$items = read_json($file);

// Subida de imagen (opcional)
if (!empty($_FILES['image']['name']) && is_uploaded_file($_FILES['image']['tmp_name'])) {
  $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, ['webp','jpg','jpeg','png'])) { http_response_code(415); exit('Tipo de imagen no permitido'); }
  $subdir = CATEGORY_DIR[$category] ?? 'Varios';
  $destDir = ASSETS_DIR . DIRECTORY_SEPARATOR . $subdir;
  if (!is_dir($destDir)) mkdir($destDir, 0775, true);
  $destName = $code . '_' . preg_replace('~[^A-Za-z0-9_]+~','_', $title) . '.' . $ext;
  $destPath = $destDir . DIRECTORY_SEPARATOR . $destName;
  if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) { http_response_code(500); exit('No se pudo guardar la imagen'); }
  $image_url = ASSETS_BASE_URL . '/' . $subdir . '/' . $destName;
}

// Arma objeto
$features = array_values(array_filter(array_map('trim', explode("\n", $featuresTxt))));
$product = [
  'title'     => $title,
  'brand'     => $brand ?: null,
  'condition' => $condition ?: 'Nuevo',
  'category'  => $category,
  'features'  => $features,
  'image'     => $image_url ?: null,
  'code'      => $code,
];

// Inserta o reemplaza por code
$replaced = false;
foreach ($items as &$p) {
  if (($p['code'] ?? '') === $code) { $p = $product; $replaced = true; break; }
}
if (!$replaced) { $items[] = $product; }

// Escribe
if (!write_json($file, $items)) { http_response_code(500); exit('No se pudo escribir JSON'); }
echo 'ok';
