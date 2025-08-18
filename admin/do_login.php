<?php
require __DIR__ . '/config.php';
if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) { http_response_code(400); exit('CSRF'); }
$user = trim($_POST['user'] ?? '');
$pass = $_POST['pass'] ?? '';
if ($user === ADMIN_USER && password_verify($pass, ADMIN_PASS_HASH)) {
  $_SESSION['auth'] = true;
  header('Location: panel.php'); exit;
}
header('Location: login.php?e=1');

