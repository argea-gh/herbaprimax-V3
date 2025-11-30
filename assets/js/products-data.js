// Mengambil data produk dari endpoint /api/products (mock-api atau backend nyata).
// Exposes:
//  - window.PRODUCTS (array)
//  - window.PRODUCTS_LOADED (Promise resolving to array)
//  - window.reloadProducts() async function to re-fetch products
(function(){
  window.PRODUCTS = window.PRODUCTS || [];

  async function fetchProducts(){
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        console.warn('products-data: fetch /api/products failed, status=', res.status);
        window.PRODUCTS = window.PRODUCTS || [];
        return window.PRODUCTS;
      }
      const data = await res.json();
      // ensure array
      window.PRODUCTS = Array.isArray(data) ? data : [];
      console.info('products-data: loaded', window.PRODUCTS.length, 'products');
      return window.PRODUCTS;
    } catch (err) {
      console.error('products-data: error fetching products', err);
      window.PRODUCTS = window.PRODUCTS || [];
      return window.PRODUCTS;
    }
  }

  window.PRODUCTS_LOADED = (async function(){
    // try to fetch; if mock-api not present or fetch fails, still resolve to empty array
    return await fetchProducts();
  })();

  window.reloadProducts = async function(){
    return await fetchProducts();
  };
})();