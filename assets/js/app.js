// Updated app.js
// - Event delegation for add-to-cart and cart controls to avoid duplicate listeners
// - Use Bootstrap tooltip for "Masukkan ke keranjang" on hover
// - Product grid updated to 6 columns (col-lg-2)
// - Testimonial layout handled via CSS .testimonials-grid
// - Floating WA & Scroll top behavior remain

// Utilities
const formatRp = (num) => {
  if (!num && num !== 0) return 'Rp 0';
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
function qs(q, el = document) { return el.querySelector(q) }
function qsa(q, el = document) { return Array.from(el.querySelectorAll(q)) }

// Cart operations (localStorage)
const CART_KEY = 'herbaprima_cart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartUI();
}

// addToCart validates stock with API and always increments by exactly `qty` requested
async function addToCart(productId, qty = 1){
  try {
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) {
      showToast('Produk tidak ditemukan (validasi stok gagal).', 'danger');
      return;
    }
    const prod = await res.json();
    const existing = cart.find(i => i.id === productId);
    const currentQty = existing ? existing.qty : 0;
    const desiredTotal = currentQty + qty;
    if (typeof prod.stock === 'number' && desiredTotal > prod.stock) {
      showToast(`Stok terbatas. Tersisa ${prod.stock} pcs.`, 'danger');
      return;
    }
    if(existing){
      existing.qty = currentQty + qty;
    } else {
      cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: qty, image: prod.image });
    }
    saveCart();
    showToast(`${prod.name} ditambahkan ke keranjang`);
  } catch (e) {
    console.error('addToCart error', e);
    showToast('Gagal menambah ke keranjang.', 'danger');
  }
}

function updateQty(productId, qty){
  const item = cart.find(it => it.id === productId);
  if(!item) return;
  item.qty = Math.max(0, qty);
  cart = cart.filter(i => i.qty > 0);
  saveCart();
}

function removeItem(productId){
  cart = cart.filter(i => i.id !== productId);
  saveCart();
}

function resetCart(){
  cart = [];
  saveCart();
}

// Toast
function showToast(msg, type = 'success'){
  const colors = {
    success: 'text-bg-success',
    danger: 'text-bg-danger',
    info: 'text-bg-info'
  };
  const t = document.createElement('div');
  t.className = `toast align-items-center ${colors[type] || 'text-bg-success'} border-0`;
  t.style.position = 'fixed'; t.style.right = '18px'; t.style.bottom = '120px'; t.style.zIndex = 1200;
  t.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="close"></button></div>`;
  document.body.appendChild(t);
  const closeBtn = t.querySelector('.btn-close');
  closeBtn.addEventListener('click', ()=> t.remove());
  setTimeout(()=> t.remove(), 3000);
}

// Render cart in offcanvas
function renderCartUI(){
  qsa('#cartCount').forEach(el => { if(el) el.textContent = cart.reduce((s,i)=>s+i.qty,0); });
  const cartItemsContainerList = qsa('#cartItems');
  cartItemsContainerList.forEach(container => {
    container.innerHTML = '';
    if(cart.length === 0){
      container.innerHTML = '<p class="text-muted">Keranjang kosong</p>';
      const totalEl = document.querySelector('#cartTotal');
      if(totalEl) totalEl.textContent = formatRp(0);
      return;
    }
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'd-flex align-items-center mb-3';
      div.dataset.id = item.id;
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width:64px;height:64px;object-fit:cover;border-radius:6px" class="me-3">
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between">
            <div><strong>${item.name}</strong><div class="small text-muted">${formatRp(item.price)}</div></div>
            <div class="text-end">
              <div class="input-group input-group-sm mb-1" style="width:110px">
                <button class="btn btn-outline-secondary cart-decrease">-</button>
                <input type="number" class="form-control text-center cart-qty-input" value="${item.qty}" min="1">
                <button class="btn btn-outline-secondary cart-increase">+</button>
              </div>
              <button class="btn btn-link btn-sm text-danger cart-remove">Hapus</button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(div);
    });

    const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
    const totalEls = document.querySelectorAll('#cartTotal');
    totalEls.forEach(el => el.textContent = formatRp(total));
  });

  // update cart count indicators if present
  const countEls = document.querySelectorAll('#cartCount');
  countEls.forEach(el=>{ if(el) el.textContent = cart.reduce((s,i)=>s+i.qty,0); });
}

// Render products (home, products page, bestsellers)
// Use col classes to show 6 columns on large (col-lg-2)
function productCardHtml(p){
  return `
    <div class="col-6 col-sm-4 col-md-3 col-lg-2">
      <div class="card product-card h-100">
        <img src="${p.image}" class="card-img-top product-img" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title">${p.name}</h6>
          <p class="small text-muted mb-2">${p.short || ''}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <div><div class="fw-bold">${formatRp(p.price)}</div></div>
            <div>
              ${p.bestseller ? '<span class="badge badge-bestseller me-2">Terlaris</span>' : ''}
              <button class="btn btn-sm btn-outline-secondary btn-detail" data-id="${p.id}">Detail</button>
              <button class="btn btn-sm btn-success ms-1 btn-add btn-add-tooltip" data-id="${p.id}" data-bs-toggle="tooltip" title="Masukkan ke keranjang"><i class="fa fa-cart-plus"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHomeProducts(){
  const container = qs('#homeProducts');
  if(!container) return;
  const items = (window.PRODUCTS || []).slice(0,6);
  container.innerHTML = items.map(productCardHtml).join('');
}

function renderBestSellers(){
  const container = qs('#bestSellers');
  if(!container) return;
  const items = (window.PRODUCTS || []).filter(p => p.bestseller).slice(0,6);
  container.innerHTML = items.map(p => `
    <div class="col-6 col-sm-4 col-md-3 col-lg-2">
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body">
          <h6>${p.name}</h6>
          <div class="d-flex justify-content-between align-items-center">
            <div class="fw-bold">${formatRp(p.price)}</div>
            <div>
              <button class="btn btn-sm btn-outline-secondary btn-detail" data-id="${p.id}">Detail</button>
              <button class="btn btn-sm btn-success btn-add" data-id="${p.id}" data-bs-toggle="tooltip" title="Masukkan ke keranjang"><i class="fa fa-cart-plus"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Products page rendering with filtering & pagination (kept mostly same, card html updated)
function renderProductsPage(){
  const grid = qs('#productsGrid');
  if(!grid) return;
  const filter = qs('#filterCategory');
  const search = qs('#searchInput');

  const urlParams = new URLSearchParams(window.location.search);
  const catFromUrl = urlParams.get('cat') || '';

  function getFiltered(){
    const q = (search && search.value) ? search.value.trim().toLowerCase() : '';
    const cat = filter ? filter.value : catFromUrl;
    return (window.PRODUCTS || []).filter(p => {
      if(cat && p.category !== cat) return false;
      if(q && !(p.name.toLowerCase().includes(q) || (p.short && p.short.toLowerCase().includes(q)))) return false;
      return true;
    });
  }

  let page = parseInt(urlParams.get('page')) || 1;
  const perPage = 12; // more per page because 6 columns

  function draw(){
    const list = getFiltered();
    const totalPages = Math.max(1, Math.ceil(list.length / perPage));
    page = Math.min(page, totalPages);
    const start = (page - 1) * perPage;
    const pageItems = list.slice(start, start + perPage);

    grid.innerHTML = pageItems.map(p => productCardHtml(p)).join('');

    const pagination = qs('#pagination');
    if(pagination){
      pagination.innerHTML = '';
      for(let p=1;p<=totalPages;p++){
        const li = document.createElement('li');
        li.className = 'page-item' + (p===page ? ' active' : '');
        li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
        li.querySelector('a').addEventListener('click', (e)=>{
          e.preventDefault();
          page = p;
          draw();
          window.scrollTo({top:200, behavior:'smooth'});
        });
        pagination.appendChild(li);
      }
    }
  }

  if(filter) filter.addEventListener('change', ()=> { page = 1; draw(); });
  if(search) search.addEventListener('input', ()=> { page = 1; draw(); });

  if(catFromUrl && filter) filter.value = catFromUrl;
  draw();
}

// Product detail page rendering from ?id=
function renderProductDetail(){
  const container = qs('#productDetail');
  if(!container) return;
  const url = new URL(window.location.href);
  const id = url.searchParams.get('id');
  const prod = (window.PRODUCTS || []).find(p => p.id === id);
  if(!prod){
    container.innerHTML = '<div class="col-12"><p>Produk tidak ditemukan.</p></div>';
    return;
  }
  container.innerHTML = `
    <div class="col-md-6">
      <div id="carouselProd" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div class="carousel-item active"><img src="${prod.image}" class="d-block w-100 rounded" alt=""></div>
          <div class="carousel-item"><img src="${prod.image}" class="d-block w-100 rounded" alt=""></div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <h2>${prod.name}</h2>
      <div class="mb-2">
        ${prod.bestseller ? '<span class="badge badge-bestseller me-2">Terlaris</span>' : ''}
        <span class="fw-bold">${formatRp(prod.price)}</span>
      </div>
      <p class="text-muted">${prod.description}</p>
      <h6>Manfaat</h6>
      <ul>${(prod.benefits||[]).map(b => `<li>${b}</li>`).join('')}</ul>
      <h6>Komposisi</h6>
      <ul>${(prod.composition||[]).map(c => `<li>${c}</li>`).join('')}</ul>

      <div class="mt-3 d-flex gap-2 align-items-center">
        <div class="input-group" style="width:160px">
          <button class="btn btn-outline-secondary" id="decQty">-</button>
          <input type="number" id="prodQty" class="form-control text-center" value="1" min="1">
          <button class="btn btn-outline-secondary" id="incQty">+</button>
        </div>
        <button id="addToCartBtn" class="btn btn-success">Tambah ke Keranjang</button>
        <a id="buyWaBtn" class="btn btn-outline-success" target="_blank"><i class="fab fa-whatsapp me-1"></i>Beli via WhatsApp</a>
      </div>
    </div>
  `;

  let qtyInput = qs('#prodQty');
  qs('#decQty').addEventListener('click', ()=> { qtyInput.value = Math.max(1, parseInt(qtyInput.value||1) - 1); });
  qs('#incQty').addEventListener('click', ()=> { qtyInput.value = Math.max(1, parseInt(qtyInput.value||1) + 1); });

  qs('#addToCartBtn').addEventListener('click', ()=> {
    addToCart(prod.id, parseInt(qtyInput.value || 1));
  });

  qs('#buyWaBtn').addEventListener('click', (e)=> {
    const qnty = parseInt(qtyInput.value || 1);
    const message = `Halo Herbaprima, saya ingin memesan:%0A- ${prod.name} Qty: ${qnty}%0ATotal: ${encodeURIComponent(formatRp(prod.price * qnty))}%0ANama:%0AAlamat:%0ANo HP:`;
    const waLink = `https://wa.me/6281234567890?text=${message}`;
    e.currentTarget.href = waLink;
  });
}

// Floating WhatsApp button: opens chat with cart contents if any
function initFloatingWA(){
  const floating = qs('#floatingWA');
  if(!floating) return;
  floating.addEventListener('click', (e) => {
    e.preventDefault();
    if(cart.length > 0){
      const msgLines = [`Halo Herbaprima, saya ingin memesan:`];
      cart.forEach(it => msgLines.push(`- ${it.name} Qty: ${it.qty}`));
      const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
      msgLines.push(`Total: ${formatRp(total)}`);
      msgLines.push('Nama:');
      msgLines.push('Alamat:');
      msgLines.push('No HP:');
      const txt = encodeURIComponent(msgLines.join('\n'));
      const wa = `https://wa.me/6281234567890?text=${txt}`;
      window.open(wa, '_blank');
    } else {
      const txt = encodeURIComponent('Halo Herbaprima, saya ingin bertanya mengenai produk & pemesanan.');
      window.open(`https://wa.me/6281234567890?text=${txt}`, '_blank');
    }
  });
}

// Checkout via WA button in cart offcanvas
function initCartCheckout(){
  qsa('#checkoutWA').forEach(btn => {
    btn && btn.addEventListener('click', ()=>{
      if(cart.length === 0){
        alert('Keranjang kosong.');
        return;
      }
      const lines = [`Halo Herbaprima, saya ingin memesan:`];
      cart.forEach(it => lines.push(`- ${it.name} Qty: ${it.qty}`));
      const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
      lines.push(`Total: ${formatRp(total)}`);
      lines.push('Nama:');
      lines.push('Alamat:');
      lines.push('No HP:');
      const txt = encodeURIComponent(lines.join('\n'));
      window.open(`https://wa.me/6281234567890?text=${txt}`, '_blank');
    });
  });
  qsa('#resetCart').forEach(b => b && b.addEventListener('click', ()=> {
    if(confirm('Reset keranjang?')) resetCart();
  }));
}

// Scroll-to-top button
function initScrollTop(){
  const btn = qs('#scrollTopBtn');
  if(!btn) return;
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 200) btn.style.display = 'flex'; else btn.style.display = 'none';
  });
  btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
}

// Preloader hide
function initPreloader(){
  window.addEventListener('load', ()=>{
    const pre = qs('#preloader');
    if(pre){
      pre.classList.add('hidden');
      setTimeout(()=> pre.style.display = 'none', 400);
    }
  });
}

// Bootstrap tooltips init (for dynamic elements)
function initTooltips(){
  // destroy existing tooltips (if any) to avoid duplicates
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => {
    // eslint-disable-next-line no-unused-vars
    try { new bootstrap.Tooltip(el); } catch(e){ /* ignore */ }
  });
}

// Cart items delegation: handle increase/decrease/remove and qty input
function initCartDelegation(){
  const container = qs('#cartItems');
  if(!container) return;
  container.addEventListener('click', async (e) => {
    const row = e.target.closest('[data-id]');
    if(!row) return;
    const id = row.dataset.id;
    if(e.target.closest('.cart-increase')){
      // validate stock then increment by 1
      try {
        const res = await fetch(`/api/products/${id}`);
        if(!res.ok){ showToast('Gagal validasi stok', 'danger'); return; }
        const p = await res.json();
        const item = cart.find(it => it.id === id);
        if(item.qty + 1 > p.stock){ showToast(`Stok terbatas. Tersisa ${p.stock} pcs.`, 'danger'); return; }
        updateQty(id, item.qty + 1);
      } catch (err){ showToast('Gagal validasi stok', 'danger'); }
    } else if(e.target.closest('.cart-decrease')){
      const item = cart.find(it => it.id === id);
      updateQty(id, item.qty - 1);
    } else if(e.target.closest('.cart-remove')){
      removeItem(id);
    }
  });

  // qty change
  container.addEventListener('change', async (e)=>{
    const input = e.target.closest('.cart-qty-input');
    if(!input) return;
    const row = input.closest('[data-id]');
    const id = row.dataset.id;
    const v = Math.max(1, parseInt(input.value) || 1);
    try {
      const res = await fetch(`/api/products/${id}`);
      if(!res.ok){ showToast('Gagal validasi stok', 'danger'); return; }
      const p = await res.json();
      if(v > p.stock){ showToast(`Stok terbatas. Tersisa ${p.stock} pcs.`, 'danger'); input.value = cart.find(c=>c.id===id).qty; return; }
      updateQty(id, v);
    } catch (err){ showToast('Gagal validasi stok', 'danger'); }
  });
}

// Global click delegation for add-to-cart and detail buttons to ensure single listener
function initGlobalDelegation(){
  document.addEventListener('click', (e)=>{
    const addBtn = e.target.closest('.btn-add');
    if(addBtn){
      const id = addBtn.dataset.id;
      addToCart(id, 1); // always increment exactly 1 per click
      return;
    }
    const det = e.target.closest('.btn-detail');
    if(det){
      const id = det.dataset.id;
      window.location.href = `product.html?id=${id}`;
      return;
    }
  });
}

// Wire up after PRODUCTS_LOADED
document.addEventListener('DOMContentLoaded', async ()=>{
  if (window.PRODUCTS_LOADED) {
    await window.PRODUCTS_LOADED.catch(()=>{});
  }

  renderCartUI();
  renderHomeProducts();
  renderBestSellers();
  renderProductsPage();
  renderProductDetail();

  initTooltips();
  initGlobalDelegation();
  initCartDelegation();
  initFloatingWA();
  initCartCheckout();
  initScrollTop();
  initPreloader();
  initThemeToggle();

  // init tooltips after a small delay (for dynamically created elements)
  setTimeout(initTooltips, 300);

  // hide preloader fallback
  setTimeout(()=> {
    const p = qs('#preloader'); if(p) { p.classList.add('hidden'); setTimeout(()=> p.style.display='none',300); }
  }, 2500);
});

// Theme toggle (kept)
function initThemeToggle(){
  const toggles = qsa('#themeToggle, #themeToggle2, #themeToggle3, #themeToggle4, #themeToggle5, #themeToggle6');
  const current = localStorage.getItem('herbaprima_theme') || 'light';
  if(current === 'dark') document.body.classList.add('dark');
  toggles.forEach(t => {
    if(!t) return;
    t.addEventListener('click', ()=>{
      document.body.classList.toggle('dark');
      const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
      localStorage.setItem('herbaprima_theme', mode);
    });
  });
}