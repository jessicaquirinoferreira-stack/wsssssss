import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from './firebase';
import { Product, Order, Coupon, StoreSettings, Category, MenuItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from './initialData';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const COUPONS_COLLECTION = 'coupons';
const SETTINGS_COLLECTION = 'settings';
const CATEGORIES_COLLECTION = 'categories';
const MENU_COLLECTION = 'menu_items';

const STORAGE_KEYS = {
  categories: 'ds_categories_cache_v3',
  products: 'ds_products_cache_v3',
  menu: 'ds_menu_cache_v3',
  settings: 'ds_settings_cache_v3',
  initialized: 'ds_firestore_initialized_v3'
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.warn(`Error reading local storage key ${key}:`, e);
  }
  return fallback;
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing local storage key ${key}:`, e);
  }
}

function cleanPayload<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    if (typeof val === 'number' && Number.isNaN(val)) continue;
    cleaned[key] = val;
  }
  return cleaned as T;
}

// Utilitário com timeout
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

// =================== PRODUTOS ===================
export async function fetchProducts(): Promise<Product[]> {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    const products: Product[] = [];
    snap.forEach((d) => {
      const data = d.data() as Product;
      products.push({ ...data, id: d.id || data.id });
    });
    if (products.length > 0) {
      setLocal(STORAGE_KEYS.products, products);
      return products;
    }
    const cached = getLocal<Product[]>(STORAGE_KEYS.products, []);
    if (cached.length > 0) return cached;

    for (const p of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, p.id), p).catch(() => {});
    }
    setLocal(STORAGE_KEYS.products, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('Fallback to local products:', err);
    return getLocal<Product[]>(STORAGE_KEYS.products, INITIAL_PRODUCTS);
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const id = (product.id || `prod-${Date.now()}`).trim();
  const rawImages = Array.isArray(product.images) ? product.images : [];
  const validImages = rawImages.filter(img => typeof img === 'string' && img.trim().length > 0);
  const images = validImages.length > 0 
    ? validImages 
    : ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'];

  const sanitized: Product = {
    id,
    name: (product.name || '').trim(),
    brand: (product.brand || '').trim(),
    category: (product.category || 'perfumes').trim(),
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || 0,
    images,
    description: (product.description || '').trim(),
    specifications: (product.specifications || '').trim(),
    stock: Math.max(0, Number(product.stock) || 0),
    weightGrams: Math.max(1, Number(product.weightGrams) || 500),
    featured: Boolean(product.featured),
    active: product.active !== false,
    tags: Array.isArray(product.tags) ? product.tags : [],
    createdAt: product.createdAt || new Date().toISOString()
  };

  const payload = cleanPayload(sanitized);
  const ref = doc(db, PRODUCTS_COLLECTION, payload.id);
  await setDoc(ref, payload);

  const current = getLocal<Product[]>(STORAGE_KEYS.products, []);
  const idx = current.findIndex(p => p.id === payload.id);
  if (idx >= 0) {
    current[idx] = payload;
  } else {
    current.unshift(payload);
  }
  setLocal(STORAGE_KEYS.products, current);
}

export async function deleteProduct(productId: string): Promise<void> {
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(ref);
  const current = getLocal<Product[]>(STORAGE_KEYS.products, []).filter(p => p.id !== productId);
  setLocal(STORAGE_KEYS.products, current);
}

// =================== CATEGORIAS (PERSISTÊNCIA FIRESTORE ABSOLUTA) ===================
export async function fetchCategories(): Promise<Category[]> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(colRef);
    const list: Category[] = [];
    
    snap.forEach((d) => {
      const data = d.data() as Category;
      const id = d.id || data.id;
      const icon = (data.iconUrl || data.image || '').trim();
      list.push({ 
        ...data, 
        id,
        image: icon,
        iconUrl: icon
      });
    });

    // Se houver registros no Firestore, eles são a fonte da verdade absoluta
    if (snap.size > 0) {
      const sorted = list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setLocal(STORAGE_KEYS.categories, sorted);
      localStorage.setItem(STORAGE_KEYS.initialized, 'true');
      return sorted;
    }

    // Se estiver vazio no Firestore, verifica se já foi inicializado antes
    const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);
    if (!isInitialized) {
      // Primeira inicialização da loja
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), cat).catch(() => {});
      }
      localStorage.setItem(STORAGE_KEYS.initialized, 'true');
      setLocal(STORAGE_KEYS.categories, INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }

    // Se o usuário excluiu todas as categorias propositalmente no Firestore
    setLocal(STORAGE_KEYS.categories, []);
    return [];
  } catch (err) {
    console.warn('Fallback to local categories cache:', err);
    return getLocal<Category[]>(STORAGE_KEYS.categories, INITIAL_CATEGORIES);
  }
}

export async function saveCategory(category: Category, previousId?: string): Promise<void> {
  const normalizedIcon = (category.iconUrl || category.image || '').trim();
  const payload: Category = {
    ...category,
    id: category.id.trim(),
    name: category.name.trim(),
    image: normalizedIcon,
    iconUrl: normalizedIcon,
    order: Number(category.order) || 1,
    active: Boolean(category.active)
  };

  // Se alterou o ID (slug), remove o documento antigo do Firestore
  if (previousId && previousId !== payload.id) {
    try {
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, previousId));
    } catch (e) {
      console.warn('Erro ao remover ID anterior:', e);
    }
  }

  // Grava o documento no Firestore
  const ref = doc(db, CATEGORIES_COLLECTION, payload.id);
  await setDoc(ref, payload);

  // Atualiza cache local instantaneamente
  const current = getLocal<Category[]>(STORAGE_KEYS.categories, []);
  const cleanList = current.filter(c => c.id !== previousId && c.id !== payload.id);
  cleanList.push(payload);
  const sorted = cleanList.sort((a, b) => (a.order || 0) - (b.order || 0));
  setLocal(STORAGE_KEYS.categories, sorted);
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const ref = doc(db, CATEGORIES_COLLECTION, categoryId);
  await deleteDoc(ref);

  // Atualiza cache local instantaneamente
  const current = getLocal<Category[]>(STORAGE_KEYS.categories, []);
  const updated = current.filter(c => c.id !== categoryId);
  setLocal(STORAGE_KEYS.categories, updated);
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

// =================== ITENS DE MENU ===================
export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const colRef = collection(db, MENU_COLLECTION);
    const snap = await getDocs(colRef);
    const list: MenuItem[] = [];
    snap.forEach((d) => {
      const data = d.data() as MenuItem;
      list.push({ ...data, id: d.id || data.id });
    });
    if (snap.size > 0) {
      const sorted = list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setLocal(STORAGE_KEYS.menu, sorted);
      return sorted;
    }
    const cached = getLocal<MenuItem[]>(STORAGE_KEYS.menu, []);
    if (cached.length > 0) return cached;

    for (const item of INITIAL_MENU_ITEMS) {
      await setDoc(doc(db, MENU_COLLECTION, item.id), item).catch(() => {});
    }
    setLocal(STORAGE_KEYS.menu, INITIAL_MENU_ITEMS);
    return INITIAL_MENU_ITEMS;
  } catch (err) {
    console.warn('Fallback to initial menu items:', err);
    return getLocal<MenuItem[]>(STORAGE_KEYS.menu, INITIAL_MENU_ITEMS);
  }
}

export async function saveMenuItem(item: MenuItem, previousId?: string): Promise<void> {
  if (previousId && previousId !== item.id) {
    try {
      await deleteDoc(doc(db, MENU_COLLECTION, previousId));
    } catch (e) {}
  }
  const ref = doc(db, MENU_COLLECTION, item.id);
  await setDoc(ref, item);
  
  const current = getLocal<MenuItem[]>(STORAGE_KEYS.menu, []).filter(m => m.id !== previousId && m.id !== item.id);
  current.push(item);
  setLocal(STORAGE_KEYS.menu, current.sort((a, b) => a.order - b.order));
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  const ref = doc(db, MENU_COLLECTION, itemId);
  await deleteDoc(ref);
  const current = getLocal<MenuItem[]>(STORAGE_KEYS.menu, []).filter(m => m.id !== itemId);
  setLocal(STORAGE_KEYS.menu, current);
}

// =================== PEDIDOS ===================
export async function fetchOrders(): Promise<Order[]> {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const snap = await getDocs(colRef);
    const orders: Order[] = [];
    snap.forEach((d) => {
      const data = d.data() as Order;
      orders.push({ ...data, id: d.id || data.id });
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Fallback to empty orders:', err);
    return [];
  }
}

export async function saveOrder(order: Order): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, order.id);
  await setDoc(ref, cleanPayload(order), { merge: true });
}

export async function updateOrderStatus(orderId: string, status: Order['status'], trackingCode?: string): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, orderId);
  const data: any = { status };
  if (trackingCode !== undefined) {
    data.trackingCode = trackingCode;
  }
  await updateDoc(ref, data);
}

// =================== CUPONS ===================
export async function fetchCoupons(): Promise<Coupon[]> {
  const initialCoupons = [
    {
      id: 'cupom-primeiracompra',
      code: 'PRIMEIRACOMPRA',
      type: 'percentage' as const,
      value: 10,
      minOrderValue: 200,
      active: true
    }
  ];

  try {
    const colRef = collection(db, COUPONS_COLLECTION);
    const snap = await getDocs(colRef);
    const coupons: Coupon[] = [];
    snap.forEach((d) => {
      const data = d.data() as Coupon;
      coupons.push({ ...data, id: d.id || data.id });
    });
    return coupons.length > 0 ? coupons : initialCoupons;
  } catch (err) {
    console.warn('Fallback to initial coupons:', err);
    return initialCoupons;
  }
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  const ref = doc(db, COUPONS_COLLECTION, coupon.id);
  await setDoc(ref, coupon, { merge: true });
}

export async function deleteCoupon(couponId: string): Promise<void> {
  const ref = doc(db, COUPONS_COLLECTION, couponId);
  await deleteDoc(ref);
}

// =================== CONFIGURAÇÕES ===================
export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, 'store_config');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, INITIAL_SETTINGS).catch(() => {});
      setLocal(STORAGE_KEYS.settings, INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    const data = snap.data() as StoreSettings;
    setLocal(STORAGE_KEYS.settings, data);
    return data;
  } catch (err) {
    console.warn('Fallback to initial settings:', err);
    return getLocal<StoreSettings>(STORAGE_KEYS.settings, INITIAL_SETTINGS);
  }
}

export async function saveSettings(settings: StoreSettings): Promise<void> {
  const ref = doc(db, SETTINGS_COLLECTION, 'store_config');
  await setDoc(ref, settings, { merge: true });
  setLocal(STORAGE_KEYS.settings, settings);
}
