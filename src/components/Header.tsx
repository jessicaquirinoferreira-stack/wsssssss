import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Instagram, 
  MessageCircle, 
  ChevronRight
} from 'lucide-react';
import { StoreSettings, Category, MenuItem } from '../types';
import { OFFICIAL_LOGO_URL } from '../lib/constants';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (view: string, categoryFilter?: string) => void;
  currentView: string;
  activeCategory?: string;
  settings: StoreSettings;
  categories: Category[];
  menuItems: MenuItem[];
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  currentView,
  activeCategory,
  settings,
  categories,
  menuItems
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Filtrar itens de menu ativos ordenados (sem k-beauty)
  const activeMenuItems = (menuItems || [])
    .filter(m => m.active && m.target !== 'k-beauty' && !m.label.toLowerCase().includes('k-beauty'))
    .sort((a, b) => a.order - b.order);

  const displayMenu = activeMenuItems.length > 0 ? activeMenuItems : [
    { id: 'todos', label: 'Todos os Produtos', type: 'all' as const, target: 'todos', order: 1, active: true },
    ...categories.filter(c => c.active && c.id !== 'k-beauty' && !c.name.toLowerCase().includes('k-beauty')).map((c, i) => ({
      id: c.id,
      label: c.name,
      type: 'category' as const,
      target: c.id,
      order: i + 2,
      active: true
    }))
  ];

  const handleMenuItemClick = (item: MenuItem) => {
    setMobileMenuOpen(false);
    if (item.type === 'link') {
      if (item.target.startsWith('http')) {
        window.open(item.target, '_blank');
      } else {
        onNavigate(item.target);
      }
    } else if (item.type === 'all' || item.target === 'todos') {
      onNavigate('catalog', undefined);
    } else {
      onNavigate('catalog', item.target);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#E7DBC9] shadow-xs">
      {/* Top Adbar Ébano Profundo com Tipografia Ouro Brilhante (#E3CEAF) */}
      <div className="bg-[#12110F] text-[#FAF6EE] text-[11px] sm:text-[12px] py-2 px-3 sm:px-6 tracking-wider uppercase border-b border-[#5C4A33]/40">
        <div className="w-full flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-[#B8966B] animate-pulse shrink-0"></span>
            <span className="font-semibold text-[#E3CEAF]">Envios para todo o Brasil</span>
            <span className="text-[#FAF6EE]/90">• 10% OFF no 1º Pedido com Cupom PRIMEIRACOMPRA</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-[#E3CEAF]/90 shrink-0">
            <a 
              href={settings.whatsapp || 'https://wa.me/5571982172459'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#FAF6EE] transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#B8966B]" />
              <span>(71) 98217-2459</span>
            </a>
            <span className="text-[#5C4A33]">|</span>
            <a 
              href={settings.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#FAF6EE] transition-colors flex items-center gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5 text-[#B8966B]" />
              <span>@dsdreamshopping_ba</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar: Logo à esquerda real sobre fundo Marfim Quente (#FAF6EE), Menu no centro e Ações à direita */}
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-2 sm:gap-4">
          
          {/* Lado Esquerdo: Hamburguer (Mobile) + Logo no Canto */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#12110F] hover:bg-[#B8966B]/15 rounded-lg transition-colors lg:hidden"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo no canto esquerdo com fundo transparente respeitado */}
            <div 
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer group flex items-center select-none py-1"
            >
              <img
                src={OFFICIAL_LOGO_URL}
                alt="Dream Shopping Oficial"
                className="h-16 sm:h-20 w-auto max-w-[200px] sm:max-w-[260px] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
              />
            </div>
          </div>

          {/* Menu de Navegação Dinâmico no Centro */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 px-4">
            {displayMenu.map((item) => {
              const isTargetActive = 
                currentView === 'catalog' && 
                ((item.type === 'all' && !activeCategory) || 
                 (item.type === 'category' && activeCategory === item.target));

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item as MenuItem)}
                  className={`px-3.5 xl:px-4 py-2 text-[12px] font-medium tracking-wider uppercase transition-all whitespace-nowrap rounded-md cursor-pointer ${
                    isTargetActive
                      ? 'bg-[#12110F] text-[#FAF6EE] shadow-sm font-semibold'
                      : 'text-[#12110F] hover:text-[#B8966B] hover:bg-[#B8966B]/15'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Lado Direito: Busca + Sacola */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate('catalog')}
              className="p-2.5 text-[#12110F] hover:bg-[#B8966B]/15 rounded-full transition-colors cursor-pointer"
              title="Buscar no Catálogo"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-[#12110F] hover:bg-[#25221E] text-[#FAF6EE] rounded-md text-xs font-semibold tracking-wider uppercase transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#B8966B]" />
              <span className="hidden sm:inline font-medium">Sacola</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#B8966B] text-[#12110F] text-[11px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Retrátil Dinâmico */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7DBC9] bg-[#FAF6EE] px-5 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] uppercase tracking-widest text-[#94734B] font-bold px-2 mb-2">
            Navegação
          </div>
          {displayMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item as MenuItem)}
              className="w-full text-left px-3 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#12110F] hover:bg-[#B8966B]/15 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#B8966B]" />
            </button>
          ))}

          <div className="pt-3 mt-3 border-t border-[#E7DBC9] space-y-2">
            <a
              href={settings.whatsapp || 'https://wa.me/5571982172459'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#12110F] hover:text-[#B8966B] rounded-lg"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp: (71) 98217-2459</span>
            </a>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#12110F] hover:text-[#B8966B] rounded-lg"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Instagram: @dsdreamshopping_ba</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
