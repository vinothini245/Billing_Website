const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const MENU_URL = `${BASE}/api/menu`;
const SALES_URL = `${BASE}/api/sales`;

const STORAGE_MENU = 'restaurant-menu-v1';
const STORAGE_SALES = 'restaurant-sales-v1';
const placeholderImage =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

function readStore(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
function writeStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function newId() { return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(); }

async function requestJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const e = new Error(`HTTP ${res.status} ${res.statusText} ${body ? `- ${body}` : ''}`);
    e.status = res.status;
    throw e;
  }
  return res.status === 204 ? null : res.json().catch(() => null);
}

/* Menu */
export async function fetchMenu() {
  try {
    const data = await requestJson(MENU_URL);
    // backend returns MenuItem DTOs; map safely
    return Array.isArray(data) ? data.map(d => ({ id: d.id, name: d.name, price: Number(d.price || 0), image: d.image || placeholderImage, category: d.category || '' })) : [];
  } catch (err) {
    // fallback local
    console.warn('fetchMenu failed, using local store', err);
    return readStore(STORAGE_MENU);
  }
}

export async function createMenuItem(payload) {
  const body = {
    name: String(payload.name || '').trim(),
    price: Number(payload.price || 0),
    image: payload.image && payload.image.trim() ? payload.image : placeholderImage,
    category: payload.category || '',
  };
  try {
    const created = await requestJson(MENU_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return created;
  } catch (err) {
    // fallback local
    const items = readStore(STORAGE_MENU);
    const item = { id: newId(), ...body };
    items.push(item);
    writeStore(STORAGE_MENU, items);
    return item;
  }
}

export async function updateMenuItem(id, payload) {
  try {
    const res = await requestJson(`${MENU_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return res;
  } catch (err) {
    // fallback local
    const items = readStore(STORAGE_MENU);
    const idx = items.findIndex(i => String(i.id) === String(id));
    if (idx === -1) throw err;
    items[idx] = { ...items[idx], ...payload };
    writeStore(STORAGE_MENU, items);
    return items[idx];
  }
}

export async function removeMenuItem(id) {
  try {
    await requestJson(`${MENU_URL}/${id}`, { method: 'DELETE' });
    return true;
  } catch (err) {
    const items = readStore(STORAGE_MENU);
    const filtered = items.filter(i => String(i.id) !== String(id));
    if (filtered.length === items.length) throw err;
    writeStore(STORAGE_MENU, filtered);
    return true;
  }
}

/* Sales */
export async function fetchSales() {
  try {
    const data = await requestJson(SALES_URL);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('fetchSales failed, using local store', err);
    return readStore(STORAGE_SALES);
  }
}

export async function createSale(payload) {
  const body = {
    total: Number(payload.total ?? (payload.items || []).reduce((s, i) => s + Number(i.lineTotal || 0), 0)),
    items: (payload.items || []).map(it => ({ name: it.name, quantity: it.quantity, lineTotal: Number(it.lineTotal) })),
    createdAt: payload.createdAt || new Date().toISOString(),
  };
  try {
    const saved = await requestJson(SALES_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return saved;
  } catch (err) {
    const sales = readStore(STORAGE_SALES);
    const sale = { id: newId(), ...body };
    sales.push(sale);
    writeStore(STORAGE_SALES, sales);
    return sale;
  }
}

export async function clearAllSales() {
  try {
    await requestJson(SALES_URL, { method: 'DELETE' });
    return true;
  } catch (err) {
    writeStore(STORAGE_SALES, []);
    return true;
  }
}

