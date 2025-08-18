<?php require __DIR__ . '/config.php'; ?>
<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Login — Admin</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;background:#0b0f14;color:#e6e6e6;display:grid;place-items:center;height:100dvh;margin:0}
.card{background:#121820;padding:28px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);width:min(420px,92vw)}
h1{margin:0 0 16px;font-size:22px}
label{display:block;margin:12px 0 6px}
input{width:100%;padding:12px;border:1px solid #2a3441;background:#0e141a;color:#e6e6e6;border-radius:10px}
button{margin-top:16px;width:100%;padding:12px;border:0;border-radius:10px;background:#16a34a;color:#fff;font-weight:600;cursor:pointer}
.error{background:#3b1b1b;padding:10px;border-radius:8px;margin-bottom:12px;color:#ffc9c9}
</style></head><body>
  <form class="card" method="post" action="do_login.php">
    <h1>Panel — Fotoinversioneszea</h1>
    <?php if (!empty($_GET['e'])): ?><div class="error">Usuario o clave inválidos.</div><?php endif;?>
    <label>Usuario</label>
    <input name="user" required>
    <label>Contraseña</label>
    <input name="pass" type="password" required>
    <input type="hidden" name="csrf" value="<?=htmlspecialchars($_SESSION['csrf'])?>">
    <button>Entrar</button>
  </form>
</body></html>
