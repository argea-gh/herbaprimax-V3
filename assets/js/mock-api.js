// Mock API (dengan switch untuk enable/disable)
// Set window.MOCK_API_ENABLED = false sebelum memuat file ini untuk mematikan mock dan menggunakan backend nyata.
// Example to disable: <script>window.MOCK_API_ENABLED = false;</script>

(function(){
  if (typeof window.MOCK_API_ENABLED !== 'undefined' && window.MOCK_API_ENABLED === false) {
    // mock explicitly disabled
    console.info('mock-api.js: disabled by window.MOCK_API_ENABLED = false');
    return;
  }

  const STORAGE_KEY = 'mock_api_products_v1';

  const initialProducts = [
    { id: 'prod-001', name: 'Madu Pahit', price: 120000, category: 'madu', image: 'https://hni.net/public/front/img/produk/MADU%20PAHIT-1_04-01-19_.png', bestseller: false, short: 'Madu pahit alami', description: 'Madu pahit murni, cocok untuk kesehatan.', benefits:['Dukungan imunitas'], composition:['Madu murni'], stock: 25 },
    { id: 'prod-002', name: 'Centella Teh Sinergi', price: 70000, category: 'suplemen', image: 'https://hni.net/public/front/img/produk/CENTELLA-1_04-01-19_.png', bestseller: false, short: 'Teh sinergi Centella', description: 'Teh herbal dengan Centella asiatica.', benefits:['Menunjang kesehatan kulit'], composition:['Centella asiatica'], stock: 30 },
    { id: 'prod-003', name: 'Deep Olive', price: 145000, category: 'essential', image: 'https://hni.net/public/front/img/produk/deep-olive-0625_16-06-25_.png', bestseller: false, short: 'Minyak berkualitas', description: 'Deep olive premium.', benefits:['Nutrisi kulit'], composition:['Olive oil'], stock: 15 },
    { id: 'prod-004', name: 'Etta Goat Milk', price: 75000, category: 'suplemen', image: 'https://hni.net/public/front/img/produk/egm-topbrand_14-11-24_.png', bestseller: false, short: 'Susu kambing berkualitas', description: 'Susu kambing full cream.', benefits:['Sumber nutrisi'], composition:['Susu kambing'], stock: 40 },
    { id: 'prod-005', name: 'Madu Multiflora', price: 100000, category: 'madu', image: 'https://hni.net/public/front/img/produk/MADU%20MULTI%202020_18-05-20_.png', bestseller: true, short: 'Madu multiflora', description: 'Madu multiflora pilihan.', benefits:['Energi & imunitas'], composition:['Madu multiflora'], stock: 20 },
    { id: 'prod-006', name: 'Madu Habbat', price: 130000, category: 'madu', image: 'https://hni.net/public/front/img/produk/MADU%20HABBATS%202020_18-05-20_.png', bestseller: true, short: 'Madu habbat', description: 'Madu dengan habbat.', benefits:['Imunitas'], composition:['Madu','Habbatussauda'], stock: 18 },
    { id: 'prod-007', name: 'Hni Coffee', price: 125000, category: 'suplemen', image: 'https://hni.net/public/front/img/produk/hcmockup2021_27-12-21_.png', bestseller: false, short: 'Kopi herbal', description: 'Kopi kesehatan HNI.', benefits:['Stamina'], composition:['Kopi robusta'], stock: 35 },
    { id: 'prod-008', name: 'Hania Susu Kambing Full Cream', price: 75000, category: 'suplemen', image: 'https://hni.net/public/front/img/produk/hania-fc-full_01-03-23_.png', bestseller: false, short: 'Susu kambing full cream', description: 'Susu kambing Hania full cream.', benefits:['Nutrisi keluarga'], composition:['Susu kambing'], stock: 28 },
    { id: 'prod-009', name: 'Sevel Stamina', price: 115000, category: 'suplemen', image: 'https://hni.net/public/front/img/produk/sevel-stamina_11-09-25_.png', bestseller: false, short: 'Suplemen stamina', description: 'Suplemen pendongkrak stamina.', benefits:['Stamina'], composition:['Ekstrak herbal'], stock: 22 },
    { id: 'prod-010', name: 'Hania Realco Cappuccino Less Sugar', price: 50000, category: 'suplemen', image: 'https://hni.net/public/front/img/produk/cappucino-lessugar1_14-11-24_.png', bestseller: false, short: 'Cappuccino less sugar', description: 'Minuman cappuccino rendah gula.', benefits:['Rasa enak'], composition:['Kopi','Susu'], stock: 50 },
    { id: 'prod-011', name: 'Madu HNI Health', price: 80000, category: 'madu', image: 'https://hni.net/public/front/img/produk/hni-health-3_18-11-24_.png', bestseller: false, short: 'Madu HNI Health', description: 'Madu kesehatan HNI.', benefits:['Imunitas'], composition:['Madu'], stock: 26 },
    { id: 'prod-012', name: 'Hania Gluta Juicy Drink', price: 185000, category: 'suplemen', image: 'https://hni.net/public/front/img/produk/gluta2_27-10-22_.png', bestseller: true, short: 'Gluta Juicy Drink', description: 'Minuman glutathione.', benefits:['Kulit cerah'], composition:['Glutathione'], stock: 12 }
  ];

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      return initialProducts.slice();
    }
    try {
      return JSON.parse(raw);
    } catch(e) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      return initialProducts.slice();
    }
  }

  function save(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  async function parseBody(options) {
    if (!options || !options.body) return null;
    try {
      return JSON.parse(options.body);
    } catch (e) {
      return null;
    }
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async function(input, options = {}) {
    const url = (typeof input === 'string') ? input : input.url;
    const method = (options.method || 'GET').toUpperCase();

    if (!url.startsWith('/api/')) {
      return originalFetch(input, options);
    }

    const parts = url.replace(/^\/api\//, '').split('/');
    const resource = parts[0];
    const id = parts[1] || null;
    const products = load();

    await new Promise(r => setTimeout(r, 150));

    if (resource === 'products') {
      if (method === 'GET' && !id) {
        return { ok: true, status: 200, json: async ()=> products.slice() };
      }
      if (method === 'GET' && id) {
        const prod = products.find(p => p.id === id);
        if (!prod) return { ok: false, status: 404, json: async ()=> ({ error: 'Not found' }) };
        return { ok: true, status: 200, json: async ()=> ({ ...prod }) };
      }
      if (method === 'POST') {
        const body = await parseBody(options);
        const newId = 'prod-' + String(Date.now()).slice(-6);
        const newProd = Object.assign({ id: newId, stock: 10, bestseller: false, category: 'suplemen', short: '', description: '', benefits: [], composition: [] }, body);
        products.unshift(newProd);
        save(products);
        return { ok: true, status: 201, json: async ()=> newProd };
      }
      if (method === 'PUT' && id) {
        const body = await parseBody(options);
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return { ok: false, status: 404, json: async ()=> ({ error: 'Not found' }) };
        products[idx] = Object.assign({}, products[idx], body);
        save(products);
        return { ok: true, status: 200, json: async ()=> products[idx] };
      }
      if (method === 'DELETE' && id) {
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return { ok: false, status: 404, json: async ()=> ({ error: 'Not found' }) };
        const removed = products.splice(idx,1);
        save(products);
        return { ok: true, status: 200, json: async ()=> removed[0] };
      }
    }

    if (resource === 'stock' && id) {
      if (method === 'GET') {
        const prod = products.find(p => p.id === id);
        if (!prod) return { ok: false, status: 404, json: async ()=> ({ error: 'Not found' }) };
        return { ok: true, status: 200, json: async ()=> ({ stock: prod.stock }) };
      }
      if (method === 'PATCH') {
        const body = await parseBody(options);
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return { ok: false, status: 404, json: async ()=> ({ error: 'Not found' }) };
        if (typeof body.stock !== 'number') return { ok: false, status: 400, json: async ()=> ({ error: 'Invalid payload' }) };
        products[idx].stock = body.stock;
        save(products);
        return { ok: true, status: 200, json: async ()=> ({ stock: products[idx].stock }) };
      }
    }

    return { ok: false, status: 404, json: async ()=> ({ error: 'Unknown API route' }) };
  };

})();