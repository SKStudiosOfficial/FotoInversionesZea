<?php
// === Credenciales (cámbialas) ===
// Genera el hash con:  php -r "echo password_hash('tu_clave_fuerte', PASSWORD_DEFAULT), PHP_EOL;"
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = '$2y$10$REEMPLAZA_ESTE_HASH';

// === Rutas ===
define('DATA_DIR', realpath(__DIR__ . '/../Data'));                 // carpeta de JSON
define('ASSETS_BASE_URL', '/assets/products');                      // URL base imágenes
define('ASSETS_DIR', realpath(__DIR__ . '/../assets/products'));    // carpeta física

// Mapa categoría -> subcarpeta para imágenes (sin tildes)
const CATEGORY_DIR = [
  'Teléfonos' => 'Telefonos',
  'Routers'   => 'Routers',
  'Hogar'     => 'Hogar',
  'Varios'    => 'Varios',
];

// Archivos JSON por categoría (ajústalo a tus nombres)
const CATEGORY_JSON = [
  'Teléfonos' => 'Telefonos.json',
  'Routers'   => 'Routers.json',
  'Hogar'     => 'Hogar.json',
  'Varios'    => 'Varios.json',
];

// Seguridad CSRF
session_name('FOTOADMIN');
session_start();
if (empty($_SESSION['csrf'])) { $_SESSION['csrf'] = bin2hex(random_bytes(32)); }

// Utilidad: lee JSON seguro
function read_json($file) {
  $path = DATA_DIR . DIRECTORY_SEPARATOR . $file;
  if (!is_file($path)) return [];
  $json = file_get_contents($path);
  $arr = json_decode($json, true);
  return is_array($arr) ? $arr : [];
}

// Utilidad: escribe JSON con lock
function write_json($file, array $data): bool {
  $path = DATA_DIR . DIRECTORY_SEPARATOR . $file;
  $tmp  = $path . '.tmp';
  $fp = fopen($tmp, 'wb');
  if (!$fp) return false;
  if (!flock($fp, LOCK_EX)) { fclose($fp); return false; }
  fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);
  return rename($tmp, $path);
}
