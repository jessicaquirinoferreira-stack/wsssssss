import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { CatalogView } from './components/CatalogView';
import { ProductDetailView } from './components/ProductDetailView';
import { CheckoutView } from './components/CheckoutView';
import { OrderSuccessView } from './components/OrderSuccessView';
import { CartDrawer } from './components/CartDrawer';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { LuxuryIntro } from './components/LuxuryIntro';

import { Product, CartItem, Order, Coupon, StoreSettings, Category, MenuItem } from './types';
import { OFFICIAL_LOGO_URL } from './lib/constants';
import { 
  fetchProducts, 
  fetchOrders, 
  fetchCoupons, 
  fetchSettings,
  fetchCategories,
  fetchMenuItems
} from './lib/storeService';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_SETTINGS 
} from './lib/initialData';
import { MessageCircle } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function App() {
  // Estado de introdução com saída leve
  const [showIntro, setShowIntro] = React.useState(true);

  // Inicialização instantânea com dados do cache local ou padrão
  const [products, setProducts] = React.useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('ds_products_cache_v3');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_PRODUCTS;
  });
  const [categories, setCategories] = React.useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('ds_categories_cache_v3') || localStorage.getItem('ds_categories_cache_v2');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_CATEGORIES;
  });
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [settings, setSettings] = React.useState<StoreSettings>(INITIAL_SETTINGS);

  // loading começa falso porque já temos produtos imediatos para visualização instantânea!
  const [loading, setLoading] = React.useState(false);

  // Navegação
  const [currentView, setCurrentView] = React.useState<'home' | 'catalog' | 'product' | 'checkout' | 'order-success' | 'admin-login' | 'admin-dashboard'>('home');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(undefined);
  const [completedOrder, setCompletedOrder] = React.useState<Order | null>(null);

  // Carrinho
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = React.useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<'pix' | 'credit_card'>('credit_card');
  const [selectedInstallments, setSelectedInstallments] = React.useState<number>(12);

  // Autenticação Admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState(false);

  // Carregar dados atualizados do Firebase Firestore em segundo plano (SWR: Stale-While-Revalidate)
  const loadData = async () => {
    try {
      const [prods, cats, menus, ords, coups, setts] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchMenuItems(),
        fetchOrders(),
        fetchCoupons(),
        fetchSettings()
      ]);
      if (prods) setProducts(prods);
      if (cats) setCategories(cats);
      if (menus) setMenuItems(menus);
      if (ords) setOrders(ords);
      if (coups) setCoupons(coups);
      if (setts) setSettings(setts);
    } catch (err) {
      console.warn('Sincronização em segundo plano:', err);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Handlers do Carrinho
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const index = prev.findIndex((i) => i.product.id === product.id);
      if (index >= 0) {
        const next = [...prev];
        next[index].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity }];
    });
    setCartDrawerOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Navegação Auxiliar
  const handleNavigate = (view: string, categoryFilter?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'catalog') {
      setSelectedCategory(categoryFilter);
      setCurrentView('catalog');
    } else if (view === 'admin') {
      if (isAdminLoggedIn) {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('admin-login');
      }
    } else {
      setCurrentView(view as any);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Renderização da view de Admin
  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setCurrentView('admin-dashboard');
        }}
        onBackToStore={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'admin-dashboard' && isAdminLoggedIn) {
    return (
      <AdminDashboard
        products={products}
        categories={categories}
        menuItems={menuItems}
        orders={orders}
        coupons={coupons}
        settings={settings}
        onRefreshData={loadData}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          setCurrentView('home');
        }}
        onNavigateSite={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#12110F] selection:bg-[#B8966B]/30 selection:text-[#12110F]">
      
      {/* Entrada Ágil de 3 Segundos com Logo Oficial Grande */}
      <AnimatePresence>
        {showIntro && (
          <LuxuryIntro
            onComplete={() => setShowIntro(false)}
            logoUrl={OFFICIAL_LOGO_URL}
          />
        )}
      </AnimatePresence>

      {/* Header do E-commerce com Menu e Categorias Dinâmicas */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setCartDrawerOpen(true)}
        onNavigate={handleNavigate}
        currentView={currentView}
        activeCategory={selectedCategory}
        settings={settings}
        categories={categories}
        menuItems={menuItems}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            categories={categories}
            settings={settings}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onViewProduct={handleViewProduct}
            onNavigateCategory={(cat) => handleNavigate('catalog', cat)}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogView
            products={products}
            categories={categories}
            initialCategory={selectedCategory}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            settings={settings}
            onAddToCart={handleAddToCart}
            onBack={() => handleNavigate('catalog', selectedProduct.category)}
            onOpenCart={() => setCartDrawerOpen(true)}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            items={cart}
            settings={settings}
            coupons={coupons}
            initialPaymentMethod={selectedPaymentMethod}
            initialInstallments={selectedInstallments}
            onPaymentMethodChange={setSelectedPaymentMethod}
            onInstallmentsChange={setSelectedInstallments}
            onBackToShop={() => setCurrentView('catalog')}
            onOrderSuccess={(order) => {
              setCompletedOrder(order);
              setCart([]);
              setCurrentView('order-success');
              loadData();
            }}
          />
        )}

        {currentView === 'order-success' && completedOrder && (
          <OrderSuccessView
            order={completedOrder}
            settings={settings}
            onContinueShopping={() => handleNavigate('catalog')}
          />
        )}
      </main>

      {/* Carrinho Lateral */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setCurrentView('checkout')}
        selectedPaymentMethod={selectedPaymentMethod}
        onChangePaymentMethod={setSelectedPaymentMethod}
        selectedInstallments={selectedInstallments}
        onChangeInstallments={setSelectedInstallments}
        settings={settings}
      />

      {/* WhatsApp Floating Button */}
      <a
        href={settings.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        title="Falar com Consultora no WhatsApp"
        aria-label="Atendimento no WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-medium text-xs pl-0 group-hover:pl-2">
          Atendimento Online
        </span>
      </a>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
        categories={categories}
      />
    </div>
  );
}
