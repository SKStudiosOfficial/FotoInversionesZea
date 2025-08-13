// Esto solo evita errores en caso de que no exista.
window.PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];

// Ícono por defecto (si no hay imagen del teléfono)
const PHONE_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <rect x="6" y="2" width="12" height="20" rx="2" ry="2" fill="currentColor" opacity=".08"></rect>
  <rect x="8" y="4" width="8" height="14" rx="1.5" ry="1.5" fill="currentColor" opacity=".14"></rect>
  <circle cx="12" cy="19" r="1" fill="currentColor" opacity=".35"></circle>
</svg>`;

// Construye link de WhatsApp con mensaje prellenado
function buildWhatsAppLink(message) {
  const phone = (window.STORE_WHATSAPP || '').replace(/[^\d]/g, ''); // Puedes setear window.STORE_WHATSAPP = "+58...";
  const base = phone ? `https://wa.me/${phone}` : `https://wa.me/`;
  const text = encodeURIComponent(message);
  return `${base}?text=${text}`;
}

// Utilidad simple para "slug"
function slugify(str = '') {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ---------- Estado de vista (home vs completo) ---------- */

const MAX_HOME_ITEMS = 10;
const url = new URL(window.location.href);
const params = url.searchParams;
let showingAll = params.get('view') === 'all';

/* ---------- Referencias DOM (robustas) ---------- */

const grid =
  document.querySelector('[data-catalog-grid]') ||
  document.getElementById('catalogGrid') ||
  document.querySelector('.catalog-grid');

const viewAllBtn = document.getElementById('viewAllBtn');
const searchInput = document.getElementById('searchInput');
const brandFilter  = document.getElementById('brandFilter');
const conditionFilter = document.getElementById('conditionFilter');

// Si tu sección catálogo tiene id="catalogo"
const catalogAnchor = document.getElementById('catalogo');

/* ---------- UI: botón "Ver catálogo completo" ---------- */

function updateViewButton(){
  if(!viewAllBtn) return;
  if(showingAll){
    viewAllBtn.classList.add('hidden');
  } else {
    viewAllBtn.classList.remove('hidden');
    viewAllBtn.href = `${location.pathname}?view=all#catalogo`;
  }
}

/* ---------- Render de productos ---------- */

function renderProducts(list){
  if(!grid) return;

  grid.innerHTML = '';
  if(!list.length){
    grid.innerHTML = `<p class="muted">No se encontraron resultados.</p>`;
    return;
  }

  const toRender = showingAll ? list : list.slice(0, MAX_HOME_ITEMS);

  toRender.forEach((p, i) => {
    const title = p.title || 'Teléfono';
    const brand = p.brand || 'Marca';
    const condition = p.condition || 'Nuevo/Usado';
    const features = Array.isArray(p.features) ? p.features : [];
    const img = p.image ? `<img src="${p.image}" alt="${title}">` : PHONE_SVG;

    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.animationDelay = (i * 60) + 'ms';
    card.innerHTML = `
      <div class="product-media">${img}</div>
      <div class="product-body">
        <h3 class="product-title">${title}</h3>
        <p class="product-meta">${brand} • ${condition}</p>
        ${features.length ? `
          <div class="badges">
            ${features.map(f => `<span class="badge-chip">${f}</span>`).join('')}
          </div>` : ''
        }
        <div class="card-actions">
          <a class="btn btn-primary" href="#contacto">Ver en tienda</a>
          <a class="btn btn-whatsapp" target="_blank" rel="noopener"
             href="${buildWhatsAppLink(`Hola, me interesa el ${title} (${brand}, ${condition}). ¿Está disponible?`)}">Consultar</a>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ---------- Filtros y búsqueda ---------- */

function getActiveFilters(){
  const q = (searchInput?.value || '').trim().toLowerCase();
  const brand = (brandFilter?.value || '').toLowerCase();
  const condition = (conditionFilter?.value || '').toLowerCase();
  return { q, brand, condition };
}

function applyFilters(){
  const { q, brand, condition } = getActiveFilters();

  const filtered = window.PRODUCTS.filter(p => {
    const title = (p.title || '').toLowerCase();
    const b = (p.brand || '').toLowerCase();
    const c = (p.condition || '').toLowerCase();
    const feat = (Array.isArray(p.features) ? p.features.join(' ') : '').toLowerCase();

    const matchQ = !q || title.includes(q) || b.includes(q) || c.includes(q) || feat.includes(q);
    const matchBrand = !brand || b === brand || slugify(b) === slugify(brand);
    const matchCondition = !condition || c === condition || slugify(c) === slugify(condition);

    return matchQ && matchBrand && matchCondition;
  });

  renderProducts(filtered);
}

function liftLimitIfNeeded(){
  if(!showingAll){
    showingAll = true;
    params.set('view','all');
    const newUrl = location.pathname + '?' + params.toString() + (catalogAnchor ? '#catalogo' : '');
    history.replaceState(null, '', newUrl);
    updateViewButton();
  }
}

/* ---------- Poblar selects (opcional) ---------- */
// Si ya rellenas tus selects desde HTML, puedes saltarte esto.
// Si quieres que se rellenen automáticamente desde PRODUCTS, descomenta:

function populateFiltersFromProducts(){
  if(brandFilter){
    const brands = [...new Set(window.PRODUCTS.map(p => (p.brand || '').trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b));
    // Preserva opción "Todas" si existe
    const hadAll = !!brandFilter.querySelector('option[value=""]');
    brandFilter.innerHTML = hadAll ? `<option value="">Todas</option>` : `<option value="">Marca</option>`;
    brands.forEach(br => {
      const opt = document.createElement('option');
      opt.value = br;
      opt.textContent = br;
      brandFilter.appendChild(opt);
    });
  }

  if(conditionFilter){
    const conditions = [...new Set(window.PRODUCTS.map(p => (p.condition || '').trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b));
    const hadAll = !!conditionFilter.querySelector('option[value=""]');
    conditionFilter.innerHTML = hadAll ? `<option value="">Todas</option>` : `<option value="">Condición</option>`;
    conditions.forEach(cn => {
      const opt = document.createElement('option');
      opt.value = cn;
      opt.textContent = cn;
      conditionFilter.appendChild(opt);
    });
  }
}

/* ---------- Init ---------- */

function initCatalog(){
  // Botón "Ver catálogo completo"
  if(viewAllBtn && !showingAll){
    viewAllBtn.setAttribute('href', `${location.pathname}?view=all#catalogo`);
  }
  updateViewButton();

  // Rellena selects (si quieres que sea dinámico)
  populateFiltersFromProducts();

  // Listeners
  if(viewAllBtn){
    viewAllBtn.addEventListener('click', (e) => {
      // si el enlace ya apunta, dejamos navegar normal; si no, forzamos
      if(!viewAllBtn.href.includes('?view=all')){
        e.preventDefault();
        showingAll = true;
        params.set('view','all');
        const newUrl = location.pathname + '?' + params.toString() + (catalogAnchor ? '#catalogo' : '');
        location.href = newUrl;
      }
    });
  }

  if(brandFilter){
    brandFilter.addEventListener('change', () => {
      liftLimitIfNeeded();
      applyFilters();
    });
  }

  if(conditionFilter){
    conditionFilter.addEventListener('change', () => {
      liftLimitIfNeeded();
      applyFilters();
    });
  }

  if(searchInput){
    // input para búsquedas en vivo
    searchInput.addEventListener('input', () => {
      liftLimitIfNeeded();
      applyFilters();
    });
  }

  // Render inicial (sin filtros)
  renderProducts(window.PRODUCTS);
}

document.readyState !== 'loading'
  ? initCatalog()
  : document.addEventListener('DOMContentLoaded', initCatalog);
