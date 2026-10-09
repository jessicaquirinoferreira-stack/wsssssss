export interface Category {
  id: string; // slug e.g. "perfumes", "bolsas", "relogios"
  name: string; // e.g. "Perfumes Importados"
  description?: string;
  image?: string; // URL da imagem/ícone da categoria
  iconUrl?: string; // URL do ícone da categoria
  order: number;
  active: boolean;
}

export interface MenuItem {
  id: string;
  label: string; // e.g. "Perfumes", "K-Beauty", "Promoções"
  type: 'category' | 'link' | 'all';
  target: string; // id da categoria correspondente ou link externo
  order: number;
  active: boolean;
  isExternal?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string; // id da categoria (dinâmica)
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  specifications?: string;
  stock: number;
  weightGrams: number;
  featured?: boolean;
  active: boolean;
  tags?: string[];
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface ShippingOption {
  carrier: 'Correios' | 'Jadlog';
  service: 'PAC' | 'SEDEX' | '.Package' | '.Com';
  price: number;
  deliveryDays: number;
  description?: string;
}

export interface CustomerAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 50 for R$ 50
  minOrderValue?: number;
  expiryDate?: string;
  active: boolean;
  usageLimit?: number;
  usageCount?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: CustomerAddress;
  shippingOption: ShippingOption;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  cardFee?: number;
  installments?: number;
  installmentAmount?: number;
  status: 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado';
  trackingCode?: string;
  notes?: string;
  paymentUrl?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  instagram: string;
  whatsapp: string;
  cepOrigin: string;
  heroImageUrl?: string;
  infinitePayHandle: string;
  infinitePayWebhookSecret?: string;
  jadlogToken?: string;
  jadlogCnpj?: string;
  blobToken?: string;
}
