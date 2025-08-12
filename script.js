// =============================
// Configuración
// =============================
const CONFIG = {
  whatsappNumber: '+0000000000', // <-- Reemplaza por tu número con código de país. Ej: +584141234567
  whatsappTextGeneral: 'Hola, me interesa su catálogo de teléfonos.',
};

// Utilidad: construir link de WhatsApp
function buildWhatsAppLink(text) {
  const phone = CONFIG.whatsappNumber.replace(/[^+0-9]/g, '');
  const urlText = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${urlText}`;
}

// Inyectar enlaces WhatsApp
function setWhatsAppLinks() {
  const links = ['whatsappHero','whatsappTop','whatsappBottom','whatsappCTA']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  links.forEach(a => a.href = buildWhatsAppLink(CONFIG.whatsappTextGeneral));
}
setWhatsAppLinks();

// Año en footer
document.getElementById('year').textContent = new Date().getFullYear();

// =============================
// Menú hamburguesa / Drawer
// =============================
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('nav-drawer');
const closeBtn = document.getElementById('drawer-close');
const backdrop = document.getElementById('backdrop');

function openDrawer(){
  drawer.classList.add('open');
  backdrop.classList.add('visible');
  hamburger.classList.add('active');
  drawer.setAttribute('aria-hidden','false');
  hamburger.setAttribute('aria-expanded','true');
  document.body.classList.add('body-lock');   // <-- añade esto
}

function closeDrawer(){
  drawer.classList.remove('open');
  backdrop.classList.remove('visible');
  hamburger.classList.remove('active');
  drawer.setAttribute('aria-hidden','true');
  hamburger.setAttribute('aria-expanded','false');
  document.body.classList.remove('body-lock'); // <-- y esto
}

hamburger.addEventListener('click', () => {
  const isOpen = drawer.classList.contains('open');
  isOpen ? closeDrawer() : openDrawer();
});
closeBtn.addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

// =============================
// Catálogo (datos demo)
// =============================
const PRODUCTS = [
  {
    id: 'ip13',
    title: 'iPhone 13 128GB',
    brand: 'Apple',
    condition: 'Reacondicionado',
    features: ['6.1" OLED', 'A15 Bionic', 'Cámara 12MP'],
    image: null,
  },
  {
    id: 's24',
    title: 'Samsung Galaxy S24 256GB',
    brand: 'Samsung',
    condition: 'Nuevo',
    features: ['6.2" AMOLED 120Hz', 'Snapdragon 8 Gen 3', 'Cámara 50MP'],
    image: null,
  },
  {
    id: 'motoG54',
    title: 'Motorola Moto G54 8GB/128GB',
    brand: 'Motorola',
    condition: 'Nuevo',
    features: ['6.5" 120Hz', 'Dimensity 7020', 'Batería 5000mAh'],
    image: null,
  },
  {
    id: 'redmi12',
    title: 'Xiaomi Redmi 12 256GB',
    brand: 'Xiaomi',
    condition: 'Nuevo',
    features: ['6.79" 90Hz', 'Cámara 50MP', 'Batería 5000mAh'],
    image: null,
  },
  {
    id: 'p30',
    title: 'Huawei P30 128GB',
    brand: 'Huawei',
    condition: 'Reacondicionado',
    features: ['6.1" OLED', 'Leica Triple Cam', 'Kirin 980'],
    image: null,
  },
  {
    id: 'realme11',
    title: 'Realme 11 Pro+ 256GB',
    brand: 'Realme',
    condition: 'Nuevo',
    features: ['Pantalla curva', 'Cámara 200MP', 'Carga rápida'],
    image: null,
  },
];

// SVG placeholder para productos sin imagen
const PHONE_SVG = `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="72" y="16" width="112" height="224" rx="22" ry="22" fill="none" stroke="currentColor" stroke-width="10"/>
  <circle cx="128" cy="212" r="10" fill="currentColor"/>
  <rect x="88" y="36" width="80" height="160" rx="12" ry="12" fill="currentColor" opacity=".08"/>
</svg>`;

// Render catálogo
const grid = document.getElementById('catalogGrid');
function renderProducts(list){
  grid.innerHTML = '';
  if(!list.length){
    grid.innerHTML = '<p>No se encontraron resultados.</p>';
    return;
  }
  list.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.animationDelay = (i * 60) + 'ms';
    card.innerHTML = `
      <div class="product-media">${p.image ? `<img src="${p.image}" alt="${p.title}">` : PHONE_SVG}</div>
      <div class="product-body">
        <h3 class="product-title">${p.title}</h3>
        <p class="product-meta">${p.brand} • ${p.condition}</p>
        <div class="badges">
          ${p.features.map(f => `<span class="badge-chip">${f}</span>`).join('')}
        </div>
        <div class="card-actions">
          <a class="btn btn-primary" href="#contacto">Ver en tienda</a>
          <a class="btn btn-whatsapp" target="_blank" rel="noopener"
             href="${buildWhatsAppLink(`Hola, me interesa el ${p.title} (${p.brand}, ${p.condition}). ¿Está disponible?`)}">Consultar</a>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}
renderProducts(PRODUCTS);

// Filtros y búsqueda
const brandFilter = document.getElementById('brandFilter');
const conditionFilter = document.getElementById('conditionFilter');
const searchInput = document.getElementById('searchInput');

function applyFilters(){
  const brand = brandFilter.value.trim();
  const cond = conditionFilter.value.trim();
  const q = searchInput.value.trim().toLowerCase();

  const result = PRODUCTS.filter(p => {
    const brandOk = !brand || p.brand === brand;
    const condOk = !cond || p.condition === cond;
    const text = (p.title + ' ' + p.brand + ' ' + p.features.join(' ')).toLowerCase();
    const searchOk = !q || text.includes(q);
    return brandOk && condOk && searchOk;
  });
  renderProducts(result);
}

[brandFilter, conditionFilter].forEach(el => el.addEventListener('change', applyFilters));
searchInput.addEventListener('input', applyFilters);

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
