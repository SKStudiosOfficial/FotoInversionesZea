// =============================
// Configuración
// =============================
const CONFIG = {
  whatsappNumber: '+584167602644', // <-- Reemplaza por tu número con código de país. Ej: +584141234567
  whatsappTextGeneral: 'Hola, me interesa su catálogo.',
};

// Utilidad: construir link de WhatsApp
function buildWhatsAppLink(text) {
  const phone = CONFIG.whatsappNumber.replace(/[^+0-9]/g, '');
  const urlText = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${urlText}`;
}

// Inyectar enlaces WhatsApp + año footer (cuando el DOM está listo)
document.addEventListener('DOMContentLoaded', () => {
  const links = ['whatsappHero','whatsappTop','whatsappBottom','whatsappCTA']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  links.forEach(a => a.href = buildWhatsAppLink(CONFIG.whatsappTextGeneral));

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

// =============================
// Menú hamburguesa / Drawer
// =============================
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('nav-drawer');
const closeBtn = document.getElementById('drawer-close');
const backdrop = document.getElementById('backdrop');

function openDrawer(){
  if(!drawer) return;
  drawer.classList.add('open');
  if(backdrop) backdrop.classList.add('visible');
  if(hamburger) hamburger.classList.add('active');
  drawer.setAttribute('aria-hidden','false');
  if(hamburger) hamburger.setAttribute('aria-expanded','true');
  document.body.classList.add('body-lock');
}

function closeDrawer(){
  if(!drawer) return;
  drawer.classList.remove('open');
  if(backdrop) backdrop.classList.remove('visible');
  if(hamburger) hamburger.classList.remove('active');
  drawer.setAttribute('aria-hidden','true');
  if(hamburger) hamburger.setAttribute('aria-expanded','false');
  document.body.classList.remove('body-lock');
}

if (hamburger) hamburger.addEventListener('click', () => {
  const isOpen = drawer?.classList.contains('open');
  isOpen ? closeDrawer() : openDrawer();
});
if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
if (backdrop) backdrop.addEventListener('click', closeDrawer);
if (drawer) drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

// =============================
// Catálogo (desde JSON)
// =============================
let PRODUCTS = [];

// SVG placeholder para productos sin imagen
const PHONE_SVG = `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="72" y="16" width="112" height="224" rx="22" ry="22" fill="none" stroke="currentColor" stroke-width="10"/>
  <circle cx="128" cy="212" r="10" fill="currentColor"/>
  <rect x="88" y="36" width="80" height="160" rx="12" ry="12" fill="currentColor" opacity=".08"/>
</svg>`;

// Render catálogo
const grid = document.getElementById('catalogGrid');
function renderProducts(list){
  if(!grid) return;
  grid.innerHTML = '';
  if(!list.length){
    grid.innerHTML = '<p>No se encontraron resultados.</p>';
    return;
  }

  // Límite opcional (home usa data-limit="10"; en /Catalogo/ no se pone y muestra todo)
  const limit = grid?.dataset?.limit ? parseInt(grid.dataset.limit, 10) : list.length;

  list.slice(0, limit).forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.animationDelay = (i * 60) + 'ms';
    const features = Array.isArray(p.features) ? p.features : [];
    card.innerHTML = `
      <div class="product-media">
        ${p.image ? `<img src="${p.image}" alt="${p.title}">` : PHONE_SVG}
      </div>
      <div class="product-body">
        <h3 class="product-title">${p.title}</h3>
        <p class="product-meta">${p.brand || '—'} • ${p.condition || '—'}</p>
        <div class="badges">
          ${features.map(f => `<span class="badge-chip">${f}</span>`).join('')}
        </div>
        <div class="card-actions">
          <a class="btn btn-primary" href="#contacto">Ver en tienda</a>
          <a class="btn btn-whatsapp" target="_blank" rel="noopener"
             href="${buildWhatsAppLink(`Hola, me interesa el ${p.title} (${p.brand || ''}, ${p.condition || ''}). ¿Está disponible?`)}">Consultar</a>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// Filtros y búsqueda (tolerantes a que no existan en Home)
const brandFilter = document.getElementById('brandFilter') || null;
const conditionFilter = document.getElementById('conditionFilter') || null;
const searchInput = document.getElementById('searchInput') || null;

function applyFilters(){
  const brand = brandFilter?.value.trim() || '';
  const cond  = conditionFilter?.value.trim() || '';
  const q     = (searchInput?.value || '').trim().toLowerCase();

  const result = PRODUCTS.filter(p => {
    const text = (p.title + ' ' + (p.brand || '') + ' ' + (Array.isArray(p.features) ? p.features.join(' ') : '')).toLowerCase();
    const brandOk = !brand || p.brand === brand;
    const condOk  = !cond  || p.condition === cond;
    const searchOk = !q || text.includes(q);
    return brandOk && condOk && searchOk;
  });

  renderProducts(result);
}

// Event listeners solo si existen los elementos
[brandFilter, conditionFilter].filter(Boolean).forEach(el => el.addEventListener('change', applyFilters));
if (searchInput) searchInput.addEventListener('input', applyFilters);

// Cargar productos desde products.json
async function loadProducts() {
  // Ruta relativa correcta según página actual
  const url = location.pathname.toLowerCase().includes('/catalogo')
    ? '../products.json'
    : 'products.json';

  try {
    const res = await fetch(url, { cache: 'no-store' });
    PRODUCTS = await res.json();
    // Si hay filtros en esta vista, respeta su estado; si no, render directo
    if (brandFilter || conditionFilter || searchInput) {
      applyFilters();
    } else {
      renderProducts(PRODUCTS);
    }
  } catch (err) {
    console.error('Error cargando products.json', err);
    renderProducts([]); // mostrará "No se encontraron resultados."
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);

// =============================
// Scroll reveal (IntersectionObserver)
// =============================
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
}, {threshold: .2});

document.querySelectorAll('.service-card.reveal').forEach(el => io.observe(el));
