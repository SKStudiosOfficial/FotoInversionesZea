<?php require __DIR__ . '/_auth.php'; ?>
<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panel</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;background:#0b0f14;color:#e6e6e6;margin:0}
nav{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#0e141a;border-bottom:1px solid #1b2532}
.container{max-width:1100px;margin:20px auto;padding:0 16px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.card{background:#121820;padding:16px;border-radius:12px}
input,select,textarea{width:100%;padding:10px;border:1px solid #2a3441;background:#0e141a;color:#e6e6e6;border-radius:10px}
label{font-size:13px;opacity:.9;margin-top:8px;display:block}
button{padding:10px 14px;border:0;border-radius:10px;background:#16a34a;color:#fff;font-weight:600;cursor:pointer}
.btn-danger{background:#dc2626}
.table{width:100%;border-collapse:collapse}
.table th,.table td{border-bottom:1px solid #1b2532;padding:8px 6px;font-size:14px}
small{opacity:.7}
</style>
</head><body>
<nav>
  <strong>Panel — Fotoinversioneszea</strong>
  <div><a href="logout.php" style="color:#ef4444;text-decoration:none">Salir</a></div>
</nav>

<div class="container">
  <div class="grid">
    <div class="card">
      <h3>Productos</h3>
      <div style="display:flex;gap:8px;margin:8px 0 12px">
        <select id="category"></select>
        <input id="search" placeholder="Buscar por título o código…">
        <button onclick="loadList()">Buscar</button>
      </div>
      <table class="table" id="list"></table>
    </div>

    <div class="card">
      <h3 id="formTitle">Crear / Editar</h3>
      <form id="form" onsubmit="return save(event)">
        <input type="hidden" name="csrf" value="<?=htmlspecialchars($_SESSION['csrf'])?>">
        <input type="hidden" name="id">
        <label>Categoría</label>
        <select name="category" required></select>

        <label>Código</label>
        <input name="code" required>

        <label>Título</label>
        <input name="title" required>

        <label>Marca</label>
        <input name="brand">

        <label>Condición</label>
        <select name="condition">
          <option>Nuevo</option><option>Usado</option>
        </select>

        <label>Features (una por línea)</label>
        <textarea name="features" rows="4"></textarea>

        <label>Imagen (subir para reemplazar)</label>
        <input type="file" name="image" accept=".webp,.jpg,.jpeg,.png">

        <label>Ruta de imagen (si ya existe)</label>
        <input name="image_url" placeholder="assets/products/Telefonos/MI_IMG.webp">

        <div style="display:flex;gap:8px;margin-top:12px">
          <button>Guardar</button>
          <button type="button" class="btn-danger" onclick="resetForm()">Limpiar</button>
        </div>
      </form>
      <small>Tip: si subes imagen, se guardará en <code>/assets/products/&lt;subcarpeta&gt;/</code> según la categoría.</small>
    </div>
  </div>
</div>

<script>
const CATEGORIES = <?=json_encode(array_keys(CATEGORY_JSON))?>;
const csrf = "<?=htmlspecialchars($_SESSION['csrf'])?>";
const selCat = document.querySelector('#category');
const selFormCat = document.querySelector('select[name="category"]');

function fillCats(){
  for(const c of CATEGORIES){
    const o1=document.createElement('option');o1.textContent=c;o1.value=c; selCat.append(o1);
    const o2=o1.cloneNode(true); selFormCat.append(o2);
  }
}
fillCats();

async function loadList(){
  const q  = document.querySelector('#search').value.trim();
  const cat= selCat.value || CATEGORIES[0];
  const res= await fetch('api/list.php?category='+encodeURIComponent(cat)+'&q='+encodeURIComponent(q));
  const data= await res.json();
  const t = document.querySelector('#list');
  t.innerHTML = '<tr><th>Cod</th><th>Título</th><th>Marca</th><th>Img</th><th></th></tr>' +
    data.items.map((p,i)=>`
      <tr>
        <td>${p.code}</td>
        <td>${p.title}<br><small>${p.condition} · ${p.category}</small></td>
        <td>${p.brand||''}</td>
        <td><small>${p.image||''}</small></td>
        <td>
          <button onclick='edit(${JSON.stringify(p)})'>Editar</button>
          <button class="btn-danger" onclick='delItem("${cat}","${p.code}")'>Borrar</button>
        </td>
      </tr>`).join('');
}
loadList();

function edit(p){
  document.querySelector('#formTitle').textContent = 'Editando: '+p.code;
  const f = document.querySelector('#form');
  f.id.value = p.code;
  f.category.value = p.category;
  f.code.value = p.code;
  f.title.value = p.title;
  f.brand.value = p.brand||'';
  f.condition.value = p.condition||'Nuevo';
  f.features.value = (p.features||[]).join('\n');
  f.image.value = null;
  f.image_url.value = p.image||'';
}

function resetForm(){
  document.querySelector('#formTitle').textContent = 'Crear / Editar';
  const f = document.querySelector('#form'); f.reset(); f.id.value='';
}

async function save(e){
  e.preventDefault();
  const f = e.target;
  const fd = new FormData(f);
  fd.set('features', (f.features.value||'').split('\n').map(s=>s.trim()).filter(Boolean).join('\n'));
  const res = await fetch('api/save.php', {method:'POST', body:fd});
  const msg = await res.text();
  if(!res.ok){ alert('Error: '+msg); return; }
  alert('Guardado'); resetForm(); loadList();
}

async function delItem(category, code){
  if(!confirm('¿Eliminar '+code+'?')) return;
  const res = await fetch('api/delete.php', {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams({category, code, csrf})
  });
  const txt = await res.text();
  if(!res.ok){ alert('Error: '+txt); return; }
  loadList();
}
</script>
</body></html>
