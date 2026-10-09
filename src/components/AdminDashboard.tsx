import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tag, 
  Settings, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  Search, 
  Minus,
  CreditCard,
  Share2,
  ExternalLink,
  Loader2,
  RefreshCw,
  FolderTree,
  Navigation,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Product, Order, Coupon, StoreSettings, CartItem, Category, MenuItem } from '../types';
import { 
  saveProduct, 
  deleteProduct, 
  updateOrderStatus, 
  saveCoupon, 
  deleteCoupon, 
  saveSettings,
  saveOrder,
  saveCategory,
  deleteCategory,
  saveMenuItem,
  deleteMenuItem
} from '../lib/storeService';
import { uploadImage } from '../lib/blobStorage';
import { OFFICIAL_LOGO_URL } from '../lib/constants';
import { CATEGORY_ICONS } from '../lib/themeIcons';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  categories: Category[];
  menuItems: MenuItem[];
  settings: StoreSettings;
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
  onNavigateSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  coupons,
  categories,
  menuItems,
  settings,
  onRefreshData,
  onLogout,
  onNavigateSite,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    'dashboard' | 'products' | 'categories' | 'menu' | 'orders' | 'pos' | 'coupons' | 'settings'
  >('dashboard');

  // Gestão de Produtos Modal / Edição
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);
  const [isSavingProduct, setIsSavingProduct] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [manualImageUrl, setManualImageUrl] = React.useState('');

  // Gestão de Categorias
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [originalCategoryId, setOriginalCategoryId] = React.useState<string>('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

  // Gestão de Menu
  const [editingMenuItem, setEditingMenuItem] = React.useState<MenuItem | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = React.useState(false);

  // PDV (Point of Sale) Estado
  const [posCart, setPosCart] = React.useState<CartItem[]>([]);
  const [posSearch, setPosSearch] = React.useState('');
  const [posDiscount, setPosDiscount] = React.useState(0);
  const [posCustomerName, setPosCustomerName] = React.useState('Cliente Presencial / Balcão');
  const [posPaymentMethod, setPosPaymentMethod] = React.useState('Pix / Dinheiro');

  // Gestão de Cupons Modal
  const [newCoupon, setNewCoupon] = React.useState<Partial<Coupon>>({
    code: '',
    type: 'percentage',
    value: 10,
    minOrderValue: 0,
    active: true
  });
  const [isCouponModalOpen, setIsCouponModalOpen] = React.useState(false);

  // Configurações form
  const [settingsForm, setSettingsForm] = React.useState<StoreSettings>(settings);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = React.useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = React.useState(false);

  React.useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHeroImage(true);
    try {
      const file = files[0];
      const url = await uploadImage(file, settingsForm.blobToken);
      setSettingsForm(prev => ({
        ...prev,
        heroImageUrl: url
      }));
    } catch (err) {
      console.error('Erro no upload da foto do hero:', err);
      alert('Não foi possível carregar a imagem do banner.');
    } finally {
      setUploadingHeroImage(false);
    }
  };

  // Métricas do Dashboard
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pendente').length;
  const lowStockProducts = products.filter(p => p.stock <= 3);

  // ================= PRODUTOS =================
  const handleOpenAddProduct = () => {
    setManualImageUrl('');
    const defaultCat = categories.length > 0 ? categories[0].id : 'perfumes';
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      brand: '',
      category: defaultCat,
      price: 0,
      originalPrice: 0,
      images: [],
      description: '',
      specifications: '',
      stock: 5,
      weightGrams: 500,
      featured: false,
      active: true,
      createdAt: new Date().toISOString()
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setManualImageUrl('');
    setEditingProduct({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza de que deseja remover este produto da vitrine?')) {
      await deleteProduct(id);
      await onRefreshData();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }
    if (!editingProduct.brand.trim()) {
      alert('Por favor, informe a marca ou grife do produto.');
      return;
    }

    // Se o usuário digitou ou colou um link de foto no campo mas não clicou em "Adicionar Foto", inclui automaticamente
    let currentImages = [...(editingProduct.images || [])];
    if (manualImageUrl.trim() && !currentImages.includes(manualImageUrl.trim())) {
      currentImages.push(manualImageUrl.trim());
      setManualImageUrl('');
    }

    const payload: Product = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      brand: editingProduct.brand.trim(),
      category: editingProduct.category || (categories[0]?.id || 'perfumes'),
      price: Number(editingProduct.price) || 0,
      originalPrice: Number(editingProduct.originalPrice) || 0,
      stock: Math.max(0, Number(editingProduct.stock) || 0),
      weightGrams: Math.max(1, Number(editingProduct.weightGrams) || 500),
      images: currentImages,
      description: (editingProduct.description || '').trim(),
      specifications: (editingProduct.specifications || '').trim(),
      featured: Boolean(editingProduct.featured),
      active: editingProduct.active !== false,
      createdAt: editingProduct.createdAt || new Date().toISOString()
    };

    try {
      setIsSavingProduct(true);
      await saveProduct(payload);
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await onRefreshData();
      confetti({ particleCount: 35, spread: 60 });
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      alert('Erro ao salvar produto no banco de dados: ' + (err?.message || 'Tente novamente'));
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!manualImageUrl.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, manualImageUrl.trim()]
    });
    setManualImageUrl('');
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      const url = await uploadImage(file, settings.blobToken);
      setEditingProduct(prev => prev ? {
        ...prev,
        images: [...prev.images, url]
      } : null);
    } catch (err) {
      console.error('Erro no upload de imagem:', err);
      alert('Não foi possível carregar a imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  // ================= CATEGORIAS =================
  const handleOpenAddCategory = () => {
    setOriginalCategoryId('');
    setEditingCategory({
      id: '',
      name: '',
      description: '',
      image: '',
      iconUrl: '',
      order: categories.length + 1,
      active: true
    });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setOriginalCategoryId(cat.id);
    const icon = cat.iconUrl || cat.image || '';
    setEditingCategory({ 
      ...cat,
      image: icon,
      iconUrl: icon
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const prodsUsing = products.filter(p => p.category === id);
    if (prodsUsing.length > 0) {
      if (!confirm(`Atenção: existem ${prodsUsing.length} produto(s) nesta categoria. Deseja realmente excluir? Os produtos ficarão sem categoria vinculada.`)) {
        return;
      }
    } else {
      if (!confirm('Deseja realmente remover esta categoria permanentemente do banco de dados?')) {
        return;
      }
    }
    await deleteCategory(id);
    await onRefreshData();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    // Normalizar ID se novo
    let id = editingCategory.id ? editingCategory.id.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
    if (!id) {
      id = editingCategory.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
    if (!id) {
      id = `cat-${Date.now()}`;
    }

    const icon = (editingCategory.iconUrl || editingCategory.image || '').trim();

    const payload: Category = {
      ...editingCategory,
      id,
      name: editingCategory.name.trim(),
      description: (editingCategory.description || '').trim(),
      image: icon,
      iconUrl: icon,
      order: Number(editingCategory.order) || 1,
      active: Boolean(editingCategory.active)
    };

    await saveCategory(payload, originalCategoryId);
    setIsCategoryModalOpen(false);
    await onRefreshData();
  };

  // ================= MENU ITENS =================
  const handleOpenAddMenuItem = () => {
    setEditingMenuItem({
      id: `menu-${Date.now()}`,
      label: '',
      type: 'category',
      target: categories.length > 0 ? categories[0].id : 'todos',
      order: menuItems.length + 1,
      active: true
    });
    setIsMenuModalOpen(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem({ ...item });
    setIsMenuModalOpen(true);
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (confirm('Deseja remover este link do menu de navegação?')) {
      await deleteMenuItem(id);
      await onRefreshData();
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;

    await saveMenuItem({
      ...editingMenuItem,
      label: editingMenuItem.label.trim(),
      order: Number(editingMenuItem.order) || 1
    });
    setIsMenuModalOpen(false);
    await onRefreshData();
  };

  // Status de Pedidos
  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    await onRefreshData();
  };

  // PDV Carrinho
  const handleAddToPosCart = (product: Product) => {
    setPosCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdatePosQuantity = (productId: string, delta: number) => {
    setPosCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleFinalizePosSale = async () => {
    if (posCart.length === 0) return;

    const subtotal = posCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = Math.max(0, subtotal - posDiscount);

    const posOrder: Order = {
      id: `pos-${Date.now()}`,
      customerName: posCustomerName,
      customerPhone: '(71) 98217-2459',
      shippingAddress: {
        cep: '41635-000',
        street: 'Venda Balcão / Retirada',
        number: 'S/N',
        neighborhood: 'Itapuã',
        city: 'Salvador',
        state: 'BA'
      },
      shippingOption: {
        carrier: 'Correios',
        service: 'PAC',
        price: 0,
        deliveryDays: 0,
        description: 'Retirada no Local / Venda Direta'
      },
      items: posCart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        productImage: i.product.images[0] || '',
        price: i.product.price,
        quantity: i.quantity
      })),
      subtotal,
      discount: posDiscount,
      shippingCost: 0,
      total,
      paymentMethod: posPaymentMethod,
      status: 'pago',
      createdAt: new Date().toISOString()
    };

    // Atualiza estoque
    for (const item of posCart) {
      const prod = products.find(p => p.id === item.product.id);
      if (prod) {
        const updated = { ...prod, stock: Math.max(0, prod.stock - item.quantity) };
        await saveProduct(updated);
      }
    }

    await saveOrder(posOrder);
    await onRefreshData();

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    setPosCart([]);
    setPosDiscount(0);
    setPosCustomerName('Cliente Presencial / Balcão');
    alert(`Venda PDV de R$ ${total.toFixed(2)} finalizada com sucesso!`);
  };

  // Salvar Configurações
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveSettings(settingsForm);
      setSettingsSavedSuccess(true);
      await onRefreshData();
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Cupons
  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) return;

    const coupon: Coupon = {
      id: `cupom-${Date.now()}`,
      code: newCoupon.code.toUpperCase().trim(),
      type: newCoupon.type as 'percentage' | 'fixed',
      value: Number(newCoupon.value),
      minOrderValue: Number(newCoupon.minOrderValue) || 0,
      active: true
    };

    await saveCoupon(coupon);
    setIsCouponModalOpen(false);
    setNewCoupon({ code: '', type: 'percentage', value: 10, minOrderValue: 0, active: true });
    await onRefreshData();
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm('Deseja excluir este cupom de desconto?')) {
      await deleteCoupon(id);
      await onRefreshData();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Navbar Admin estilo Paty Lara */}
      <div className="bg-[#0e2855] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#0e2855]/30">
        <div className="flex items-center gap-4">
          <img
            src={OFFICIAL_LOGO_URL}
            alt="Dream Shopping"
            className="h-11 w-auto object-contain drop-shadow-sm"
          />
          <span className="text-[11px] uppercase tracking-widest bg-white/10 text-[#75abeb] px-2.5 py-1 rounded-md font-semibold border border-white/15">
            Painel Administrativo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateSite}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#75abeb]" />
            <span>Ver Loja</span>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-[#0e2855]/10 p-4 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#0e2855] text-white shadow-sm' : 'text-[#0e2855] hover:bg-[#f4f8fd]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#75abeb]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-[#0e2855] text-white shadow-sm' : 'text-[#0e2855] hover:bg-[#f4f8fd]'
            }`}
          >
            <Package className="w-4 h-4 text-[#75abeb]" />
            <span>Produtos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'categories' ? 'bg-[#0e2855] text-white shadow-sm' : 'text-[#0e2855] hover:bg-[#f4f8fd]'
            }`}
          >
            <FolderTree className="w-4 h-4 text-[#75abeb]" />
            <span>Categorias ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'menu' ? 'bg-[#0e2855] text-white shadow-sm' : 'text-[#0e2855] hover:bg-[#f4f8fd]'
            }`}
          >
            <Navigation className="w-4 h-4 text-[#75abeb]" />
            <span>Menu do Site ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#0e2855] text-white shadow-sm' : 'text-[#0e2855] hover:bg-[#f4f8fd]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#75abeb]" />
            <div className="flex-1 flex justify-between items-center">
              <span>Pedidos</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-[#75abeb] text-[#0e2855] font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'pos' ? 'bg-[#0e2855] text-white shadow-sm' : 'text-[#0e2855] hover:bg-[#f4f8fd]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#75abeb]" />
            <span>PDV / Venda Rápida</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'coupons' ? 'bg-[#0e2855] text-white shadow-sm' : 'text-[#0e2855] hover:bg-[#f4f8fd]'
            }`}
          >
            <Tag className="w-4 h-4 text-[#75abeb]" />
            <span>Cupons de Desconto</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#0e2855] text-white shadow-sm' : 'text-[#0e2855] hover:bg-[#f4f8fd]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#75abeb]" />
            <span>Configurações & Chaves</span>
          </button>

          <div className="pt-6 mt-6 border-t border-stone-200 px-2 text-[11px] text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700">Origem Logística:</p>
            <p>Itapuã, Salvador - BA</p>
            <p>CEP: {settings.cepOrigin || '41635-000'}</p>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Visão Geral do Negócio</h1>
                  <p className="text-xs text-stone-500">Métricas em tempo real de vendas e pedidos da Dream Shopping.</p>
                </div>
                <button
                  onClick={() => onRefreshData()}
                  className="px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 flex items-center gap-2 self-start"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar Firestore</span>
                </button>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium uppercase tracking-wider">
                    <span>Faturamento Total</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-serif-luxury text-2xl font-bold text-stone-900">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Pedidos aprovados & PDV
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium uppercase tracking-wider">
                    <span>Total de Pedidos</span>
                    <ShoppingBag className="w-4 h-4 text-[#9A7B3E]" />
                  </div>
                  <div className="font-serif-luxury text-2xl font-bold text-stone-900">
                    {totalOrdersCount}
                  </div>
                  <span className="text-[10px] text-stone-500">Histórico completo</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium uppercase tracking-wider">
                    <span>Pedidos Pendentes</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-serif-luxury text-2xl font-bold text-stone-900">
                    {pendingOrdersCount}
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                    Aguardando envio / pagamento
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium uppercase tracking-wider">
                    <span>Estoque Baixo</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="font-serif-luxury text-2xl font-bold text-stone-900">
                    {lowStockProducts.length}
                  </div>
                  <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full inline-block">
                    ≤ 3 unidades restantes
                  </span>
                </div>
              </div>

              {/* Acesso rápido às novas abas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">Categorias Cadastradas</h3>
                    <button 
                      onClick={() => setActiveTab('categories')}
                      className="text-xs uppercase font-bold text-[#9A7B3E] hover:underline"
                    >
                      Gerenciar →
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">
                    Existem {categories.length} categoria(s) configuradas para organizar a vitrine e catálogo da loja.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {categories.map(c => (
                      <span key={c.id} className="text-[11px] px-2.5 py-1 bg-stone-100 rounded-lg text-stone-700 font-medium">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">Itens do Menu Superior</h3>
                    <button 
                      onClick={() => setActiveTab('menu')}
                      className="text-xs uppercase font-bold text-[#9A7B3E] hover:underline"
                    >
                      Gerenciar →
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">
                    Existem {menuItems.length} item(ns) exibidos na barra de navegação no cabeçalho do site.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {menuItems.map(m => (
                      <span key={m.id} className="text-[11px] px-2.5 py-1 bg-[#FAF5EC] border border-[#E9DFCE] rounded-lg text-[#9A7B3E] font-semibold">
                        {m.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUTOS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Catálogo de Produtos</h1>
                  <p className="text-xs text-stone-500">Cadastre, edite estoque, fotos e especificações técnicas de cada produto.</p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-5 py-3 bg-stone-900 hover:bg-[#9A7B3E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Produto</span>
                </button>
              </div>

              {/* Tabela de Produtos */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Produto</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4">Preço</th>
                        <th className="py-3 px-4">Estoque</th>
                        <th className="py-3 px-4">Peso</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products.map(p => {
                        const catObj = categories.find(c => c.id === p.category);
                        return (
                          <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={p.images[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=100&q=80'}
                                alt=""
                                className="w-10 h-10 object-cover rounded-lg bg-stone-100 border border-stone-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-stone-900 truncate max-w-xs">{p.name}</p>
                                <span className="text-[10px] text-[#9A7B3E] font-medium">{p.brand}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 uppercase font-semibold text-[10px] text-stone-500">
                              {catObj ? catObj.name : p.category}
                            </td>
                            <td className="py-3 px-4 font-serif-luxury font-bold text-stone-900 text-sm">
                              R$ {p.price.toFixed(2).replace('.', ',')}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-semibold ${p.stock <= 3 ? 'text-rose-600' : 'text-stone-800'}`}>
                                {p.stock} un.
                              </span>
                            </td>
                            <td className="py-3 px-4 text-stone-500">
                              {p.weightGrams}g
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                              }`}>
                                {p.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="p-1.5 hover:bg-stone-100 rounded text-stone-600 hover:text-stone-900"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 hover:bg-rose-50 rounded text-stone-400 hover:text-rose-600"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIAS (NOVA ÁREA COMPLETA) */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Gerenciar Categorias</h1>
                  <p className="text-xs text-stone-500">
                    Adicione novas categorias, altere nomes, descrições, imagens e a ordem de exibição na loja.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddCategory}
                  className="px-5 py-3 bg-stone-900 hover:bg-[#9A7B3E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Categoria</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const countProds = products.filter(p => p.category === cat.id).length;
                  return (
                    <div 
                      key={cat.id} 
                      className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                              ID: {cat.id}
                            </span>
                            <h3 className="font-serif-luxury text-xl font-bold text-stone-900 mt-1">
                              {cat.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditCategory(cat)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                              title="Editar Categoria"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Excluir Categoria"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {cat.description && (
                          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        )}

                        {cat.image && (
                          <div className="h-28 w-full rounded-xl overflow-hidden border border-stone-100">
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                        <span>{countProds} produtos vinculados</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase bg-[#FAF5EC] text-[#9A7B3E] px-2 py-0.5 rounded">
                            Ordem: #{cat.order}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}>
                            {cat.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MENU DO SITE (NOVA ÁREA COMPLETA) */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Editar Menu de Navegação</h1>
                  <p className="text-xs text-stone-500">
                    Gerencie os botões e links que aparecem no cabeçalho e menu mobile do site.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddMenuItem}
                  className="px-5 py-3 bg-stone-900 hover:bg-[#9A7B3E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Link de Menu</span>
                </button>
              </div>

              {/* Lista dos Itens de Menu */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
                  <span>Itens exibidos no Cabeçalho ({menuItems.length})</span>
                  <span>Ordem de exibição</span>
                </div>
                <div className="divide-y divide-stone-100">
                  {menuItems.sort((a,b) => a.order - b.order).map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-stone-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-xs">
                          {item.order}
                        </span>
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{item.label}</p>
                          <p className="text-xs text-stone-400">
                            Tipo: <span className="font-mono text-[#9A7B3E]">{item.type}</span> • Alvo: <span className="font-mono">{item.target}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {item.active ? 'Visível' : 'Oculto'}
                        </span>
                        <button
                          onClick={() => handleEditMenuItem(item)}
                          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PEDIDOS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Gestão de Pedidos</h1>
                <p className="text-xs text-stone-500">Acompanhe vendas feitas pelo checkout InfinitePay e gere código de rastreamento.</p>
              </div>

              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
                    Nenhum pedido realizado ainda.
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#9A7B3E] uppercase">
                            #{order.id}
                          </span>
                          <h3 className="font-semibold text-stone-900 text-sm mt-0.5">
                            {order.customerName} • {order.customerPhone}
                          </h3>
                          <span className="text-[11px] text-stone-400">
                            {new Date(order.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregue">Entregue</option>
                            <option value="cancelado">Cancelado</option>
                          </select>

                          <div className="text-right">
                            <span className="font-serif-luxury text-lg font-bold text-stone-900 block">
                              R$ {order.total.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-[10px] text-stone-500 font-semibold uppercase block">
                              {order.paymentMethod || 'Pix à Vista'}
                              {order.installments && order.installments > 1 ? ` (${order.installments}x de R$ ${(order.installmentAmount || (order.total / order.installments)).toFixed(2).replace('.', ',')})` : ''}
                            </span>
                            {order.cardFee && order.cardFee > 0 ? (
                              <span className="text-[9px] text-amber-700 font-medium block">
                                Taxa InfinitePay: R$ {order.cardFee.toFixed(2).replace('.', ',')}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Itens */}
                      <div className="text-xs space-y-1 text-stone-600">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{it.quantity}x {it.productName}</span>
                            <span>R$ {(it.price * it.quantity).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Endereço & Frete */}
                      <div className="text-[11px] bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex flex-col sm:flex-row justify-between gap-2 text-stone-600">
                        <div>
                          <span className="font-semibold text-stone-800">Endereço de Entrega:</span> {order.shippingAddress.street}, {order.shippingAddress.number} {order.shippingAddress.complement || ''} - {order.shippingAddress.neighborhood}, {order.shippingAddress.city}/{order.shippingAddress.state} (CEP: {order.shippingAddress.cep})
                        </div>
                        <div className="shrink-0 text-stone-800 font-medium">
                          Frete: {order.shippingOption.carrier} {order.shippingOption.service} (R$ {order.shippingCost.toFixed(2)})
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PDV */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">PDV - Venda Rápida / Balcão</h1>
                  <p className="text-xs text-stone-500">Registre vendas presenciais ou no WhatsApp com baixa imediata de estoque.</p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar produto por nome ou marca para adicionar ao carrinho..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-[#9A7B3E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {products
                    .filter(p => p.active && (p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.brand.toLowerCase().includes(posSearch.toLowerCase())))
                    .map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleAddToPosCart(p)}
                        className="bg-white p-3 rounded-xl border border-stone-200/80 hover:border-[#9A7B3E] cursor-pointer transition-all flex items-center gap-3 shadow-xs"
                      >
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-stone-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-stone-500">Estoque: {p.stock} un.</p>
                          <p className="text-xs font-serif-luxury font-bold text-[#9A7B3E]">R$ {p.price.toFixed(2)}</p>
                        </div>
                        <Plus className="w-4 h-4 text-stone-400 shrink-0" />
                      </div>
                    ))}
                </div>
              </div>

              {/* Sacola PDV */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-stone-900 pb-3 border-b border-stone-100">
                    Cupom de Venda
                  </h3>

                  <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto my-3">
                    {posCart.length === 0 ? (
                      <p className="text-xs text-stone-400 py-8 text-center">Nenhum item selecionado.</p>
                    ) : (
                      posCart.map(item => (
                        <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-semibold text-stone-900 truncate">{item.product.name}</p>
                            <span className="text-stone-500 text-[11px]">R$ {item.product.price.toFixed(2)} un.</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdatePosQuantity(item.product.id, -1)}
                              className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdatePosQuantity(item.product.id, 1)}
                              className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
                    <div>
                      <label className="block text-stone-600 mb-1">Cliente / Destinatário</label>
                      <input
                        type="text"
                        value={posCustomerName}
                        onChange={(e) => setPosCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Forma de Pagamento</label>
                      <select
                        value={posPaymentMethod}
                        onChange={(e) => setPosPaymentMethod(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg bg-white"
                      >
                        <option value="Pix / Dinheiro">Pix / Dinheiro</option>
                        <option value="Cartão Débito">Cartão Débito</option>
                        <option value="Cartão Crédito">Cartão Crédito</option>
                        <option value="InfinitePay Link">InfinitePay Link</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="flex justify-between text-base font-bold text-stone-900">
                    <span>Total a Pagar:</span>
                    <span>
                      R$ {posCart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    onClick={handleFinalizePosSale}
                    disabled={posCart.length === 0}
                    className="w-full py-3 bg-stone-900 hover:bg-[#9A7B3E] disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Confirmar e Dar Baixa no Estoque
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Cupons de Desconto</h1>
                  <p className="text-xs text-stone-500">Crie campanhas promocionais com valor fixo ou porcentagem.</p>
                </div>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-5 py-3 bg-stone-900 hover:bg-[#9A7B3E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Cupom</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                  <div key={coupon.id} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5EC] border border-[#E9DFCE] rounded-lg text-xs font-mono font-bold text-[#9A7B3E]">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{coupon.code}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="font-serif-luxury text-2xl font-bold text-stone-900">
                      {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `R$ ${coupon.value.toFixed(2)} OFF`}
                    </div>

                    <div className="text-xs text-stone-500 space-y-1">
                      {coupon.minOrderValue ? (
                        <p>Pedido mínimo: R$ {coupon.minOrderValue.toFixed(2)}</p>
                      ) : (
                        <p>Sem pedido mínimo</p>
                      )}
                      <p>Status: <span className={coupon.active ? 'text-emerald-700 font-semibold' : 'text-stone-400'}>{coupon.active ? 'Ativo' : 'Inativo'}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: CONFIGURAÇÕES */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Configurações & Chaves da Loja</h1>
                <p className="text-xs text-stone-500">Configure suas integrações de pagamento InfinitePay, Correios e redes sociais.</p>
              </div>

              {settingsSavedSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Configurações atualizadas com sucesso no Firestore!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettingsSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
                
                {/* Loja & Redes */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[#9A7B3E]">
                    Informações Oficiais da Boutique
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nome da Loja</label>
                    <input
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp Oficial (com DDI/DDD)</label>
                      <input
                        type="text"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Link do Instagram</label>
                      <input
                        type="text"
                        value={settingsForm.instagram}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Principal / Foto do Hero */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-widest text-[#9A7B3E]">
                      Foto do Banner Principal (Hero da Loja)
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Esta é a imagem de destaque exibida no topo da página inicial da loja.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Preview da foto */}
                    <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-xl overflow-hidden border-2 border-stone-200 bg-stone-100 shrink-0 shadow-xs relative group">
                      <img
                        src={settingsForm.heroImageUrl || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85"}
                        alt="Preview Hero"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold text-center p-2">
                        Foto Atual do Hero
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Link direto da imagem (URL)
                        </label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={settingsForm.heroImageUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#12110F] hover:bg-[#25221E] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                          {uploadingHeroImage ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D5BFA0]" />
                              <span>Enviando foto...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-[#D5BFA0]" />
                              <span>Enviar Foto do Celular / Computador</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingHeroImage}
                            onChange={handleHeroImageUpload}
                            className="hidden"
                          />
                        </label>

                        {settingsForm.heroImageUrl && (
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, heroImageUrl: '' })}
                            className="px-3 py-2 border border-stone-300 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-medium cursor-pointer"
                          >
                            Restaurar Foto Padrão
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400">
                        Dica: fotos verticais ou no formato 4:5 proporcionam um resultado luxuoso e perfeito no topo do site.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pagamento InfinitePay */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[#9A7B3E]">
                    InfinitePay Checkout Integrado
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      InfinitePay Handle / Tag (sem o $)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.infinitePayHandle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, infinitePayHandle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 outline-none font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Utilizado para gerar links de cobrança oficiais da InfinitePay para seus clientes.
                    </p>
                  </div>
                </div>

                {/* Logística & Frete */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[#9A7B3E]">
                    Frete & Origem dos Envios
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      CEP de Origem (Itapuã, Salvador - BA)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.cepOrigin}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cepOrigin: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Vercel Blob Token */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[#9A7B3E]">
                    Upload de Imagens Vercel Blob
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      BLOB_READ_WRITE_TOKEN (Opcional - CDN Vercel)
                    </label>
                    <input
                      type="password"
                      placeholder="vercel_blob_rw_..."
                      value={settingsForm.blobToken || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, blobToken: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 bg-stone-900 hover:bg-[#9A7B3E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Salvar Configurações</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* MODAL EDITAR / CRIAR PRODUTO */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                {editingProduct.id.startsWith('prod-') ? 'Cadastrar Novo Produto' : 'Editar Produto'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Marca / Grife *</label>
                  <input
                    type="text"
                    required
                    placeholder="Michael Kors, Medicube, Tom Ford..."
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Categoria *</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="perfumes">Perfumes</option>
                        <option value="cabelo">Cabelo</option>
                        <option value="bolsas">Bolsas</option>
                        <option value="baby-kids">Baby & Kids</option>
                        <option value="skincare">Skin Care</option>
                        <option value="promocoes">Promoções</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Preço Original / De (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Estoque Disponível *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Peso em Gramas (para cálculo de frete)</label>
                  <input
                    type="number"
                    value={editingProduct.weightGrams}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weightGrams: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Upload e Inclusão de Fotos */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="font-semibold block mb-1">Fotos do Produto</label>
                  <p className="text-[11px] text-stone-500 mb-2">
                    Você pode <strong>escolher fotos do seu computador/celular</strong> ou <strong>colar links de fotos</strong> (Instagram, fornecedor ou sites).
                  </p>
                </div>

                {/* Opção 1: Upload de Arquivo direto do Computador ou Celular */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-[#0e2855] uppercase block">
                    1. Enviar Foto do seu Computador / Celular
                  </span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0e2855] file:text-white hover:file:bg-[#163c7e] cursor-pointer"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-[#75abeb]" />}
                  </div>
                </div>

                {/* Opção 2: Colar Link Direto da Imagem */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-[#0e2855] uppercase block">
                    2. Ou colar Link / URL da Imagem (Instagram, Google Fotos, Web)
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto-do-produto.jpg"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg outline-none text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!manualImageUrl.trim()}
                      className="px-4 py-1.5 bg-[#0e2855] hover:bg-[#163c7e] disabled:opacity-40 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Adicionar Foto
                    </button>
                  </div>
                </div>

                {/* Galeria de Fotos Adicionadas com Exclusão */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-stone-700 block">
                    Fotos cadastradas ({editingProduct.images.length}):
                  </span>
                  {editingProduct.images.length === 0 ? (
                    <p className="text-[11px] text-stone-400 italic">Nenhuma foto adicionada ainda.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {editingProduct.images.map((img, idx) => (
                        <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-stone-200 shadow-xs">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditingProduct({
                              ...editingProduct,
                              images: editingProduct.images.filter((_, i) => i !== idx)
                            })}
                            className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                            title="Remover foto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Descrição Comercial</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Produto em Destaque na Home</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProduct.active}
                    onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Visível na Loja</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isSavingProduct}
                  className="px-4 py-2 border rounded-xl hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-2 bg-stone-900 text-white rounded-xl uppercase font-semibold hover:bg-[#9A7B3E] disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  {isSavingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D5BFA0]" />
                      <span>Gravando no Banco...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#D5BFA0]" />
                      <span>Salvar Produto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIA (CRIAR / EDITAR) */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b">
              <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
                {editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Óculos de Sol, Relógios..."
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Identificador / Slug (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: oculos-de-sol (automático se vazio)"
                  value={editingCategory.id}
                  onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Descrição Breve</label>
                <textarea
                  rows={2}
                  placeholder="Apresentação da categoria para o cliente..."
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">URL do Ícone / Imagem da Categoria (via URL) *</label>
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-16 h-16 rounded-full border-2 border-[#B8966B] bg-[#12110F] overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                    {editingCategory.image || editingCategory.iconUrl ? (
                      <img 
                        src={editingCategory.iconUrl || editingCategory.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://i.postimg.cc/MHs5gqgq/2756.jpg';
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-[#B8966B]">Ícone</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      required
                      placeholder="https://i.postimg.cc/... ou link de imagem"
                      value={editingCategory.iconUrl || editingCategory.image || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingCategory({ 
                          ...editingCategory, 
                          image: val,
                          iconUrl: val 
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[11px] bg-white"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Cole qualquer link de imagem (PostImages, Imgur, CDN) ou selecione um modelo abaixo:
                    </p>
                  </div>
                </div>

                {/* Ícones Rápidos Oficiais */}
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-700 uppercase block">
                    Modelos de Ícones Oficiais (Clique para aplicar):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Perfumes', url: 'https://i.postimg.cc/MHs5gqgq/2756.jpg' },
                      { name: 'Cabelo', url: 'https://i.postimg.cc/SRZdHkHx/2757.jpg' },
                      { name: 'Bolsas', url: 'https://i.postimg.cc/2yjTHV93/2758.jpg' },
                      { name: 'Baby & Kids', url: 'https://i.postimg.cc/90xbsCsF/2766.jpg' },
                      { name: 'Skin Care', url: 'https://i.postimg.cc/tJrk8p8R/2767.jpg' },
                      { name: 'Promoções', url: '/promocao_icon.jpg' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditingCategory({
                          ...editingCategory,
                          image: preset.url,
                          iconUrl: preset.url
                        })}
                        className="px-2 py-1 bg-white hover:bg-[#B8966B]/15 border border-stone-200 rounded-md text-[10px] font-medium text-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={editingCategory.order}
                    onChange={(e) => setEditingCategory({ ...editingCategory, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={editingCategory.active}
                      onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Categoria Ativa</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl uppercase font-semibold hover:bg-[#9A7B3E]"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MENU ITEM (CRIAR / EDITAR) */}
      {isMenuModalOpen && editingMenuItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b">
              <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
                {editingMenuItem.label ? 'Editar Link do Menu' : 'Novo Link de Menu'}
              </h2>
              <button onClick={() => setIsMenuModalOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Título no Menu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Perfumes, Bolsas, Outlet..."
                  value={editingMenuItem.label}
                  onChange={(e) => setEditingMenuItem({ ...editingMenuItem, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Tipo de Ação</label>
                  <select
                    value={editingMenuItem.type}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setEditingMenuItem({
                        ...editingMenuItem,
                        type,
                        target: type === 'all' ? 'todos' : categories[0]?.id || ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="category">Filtrar Categoria</option>
                    <option value="all">Todos os Produtos</option>
                    <option value="link">Link Livre / Externo</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Destino / Alvo</label>
                  {editingMenuItem.type === 'category' ? (
                    <select
                      value={editingMenuItem.target}
                      onChange={(e) => setEditingMenuItem({ ...editingMenuItem, target: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : editingMenuItem.type === 'all' ? (
                    <input
                      type="text"
                      disabled
                      value="Catálogo Completo"
                      className="w-full px-3 py-2 border rounded-xl bg-stone-100 text-stone-500"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="https://... ou nome da rota"
                      value={editingMenuItem.target}
                      onChange={(e) => setEditingMenuItem({ ...editingMenuItem, target: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Ordem na Barra</label>
                  <input
                    type="number"
                    value={editingMenuItem.order}
                    onChange={(e) => setEditingMenuItem({ ...editingMenuItem, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={editingMenuItem.active}
                      onChange={(e) => setEditingMenuItem({ ...editingMenuItem, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Link Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl uppercase font-semibold hover:bg-[#9A7B3E]"
                >
                  Salvar Item de Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO CUPOM */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h2 className="font-serif-luxury text-xl font-bold text-stone-900">Criar Novo Cupom</h2>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  placeholder="EX: VERAO15"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tipo de Desconto</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Valor do Desconto *</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Valor Mínimo do Pedido (R$)</label>
                <input
                  type="number"
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl uppercase font-semibold"
                >
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
