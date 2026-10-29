const BASE_URL = 'https://dummyjson.com/products';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// The assignment says to show every field except `meta`, so drop it here
// and the rest of the app never has to think about it.
const stripMeta = ({ meta, ...rest }) => rest;

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

// READ: GET /products?limit=&skip=
export async function getProducts({ limit = 10, skip = 0 } = {}) {
  const data = await request(`${BASE_URL}?limit=${limit}&skip=${skip}`);
  return { ...data, products: data.products.map(stripMeta) };
}

// CREATE: POST /products/add
export async function createProduct(product) {
  const data = await request(`${BASE_URL}/add`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(product),
  });
  return stripMeta(data);
}

// UPDATE: PUT /products/{id}
export async function updateProduct(id, changes) {
  const data = await request(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(changes),
  });
  return stripMeta(data);
}

// DELETE: DELETE /products/{id}
export async function deleteProduct(id) {
  const data = await request(`${BASE_URL}/${id}`, { method: 'DELETE' });
  return stripMeta(data);
}   