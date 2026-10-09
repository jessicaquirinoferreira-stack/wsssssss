import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORY_ICONS } from '../lib/themeIcons';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  initialCategory,
  onAddToCart,
  onViewProduct
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory || 'todos');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const activeCategories = (categories || [])
    .filter(c => c.active && c.id !== 'k-beauty' && !c.name.toLowerCase().includes('k-beauty'))
    .sort((a, b) => a.order - b.order);

  const displayCategories = [
    { id: 'todos', name: 'Todos os Produtos' },
    ...activeCategories
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch && p.active;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const activeCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAF6EE]">
      {/* Título & Cabeçalho */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-[#B8966B]">
          Acervo Exclusivo 100% Original
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#12110F] uppercase">
          {selectedCategory === 'todos' 
            ? 'Coleção Completa de Importados' 
            : activeCategoryObj?.name || 'Catálogo de Produtos'}
        </h1>
        <div className="w-16 h-0.5 bg-[#B8966B] mx-auto my-2"></div>
        <p className="text-[#5C4A33] text-xs sm:text-sm">
          {activeCategoryObj?.description || 'Perfumes importados, bolsas de grife, cosméticos coreanos e roupas infantis com envio seguro e parcelamento em até 12x.'}
        </p>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#F4ECE1] p-4 rounded-xl border border-[#E7DBC9] shadow-xs">
        
        {/* Categorias Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {displayCategories.map((cat: any) => {
            const isCatSelected = selectedCategory === cat.id;
            const iconUrl = cat.iconUrl || cat.image || CATEGORY_ICONS[cat.id] || CATEGORY_ICONS[cat.name?.toLowerCase()];

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isCatSelected
                    ? 'bg-[#12110F] text-[#FAF6EE] shadow-xs border border-[#B8966B]/40'
                    : 'bg-white text-[#12110F] hover:bg-[#B8966B]/15 border border-[#E7DBC9]'
                }`}
              >
                {iconUrl && (
                  <img src={iconUrl} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Busca e Ordenação */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94734B]" />
            <input
              type="text"
              placeholder="Buscar no catálogo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7DBC9] rounded-md text-xs focus:outline-none focus:border-[#B8966B] text-[#12110F] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-[#E7DBC9] rounded-md px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#94734B]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-medium text-[#12110F] focus:outline-none cursor-pointer"
            >
              <option value="featured">Destaques</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="name">Nome (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Produtos */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#F4ECE1] rounded-2xl border border-[#E7DBC9] space-y-4">
          <p className="text-[#5C4A33] text-sm">Nenhum produto encontrado nesta categoria ou busca.</p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSearchQuery('');
            }}
            className="px-6 py-2.5 bg-[#12110F] text-[#FAF6EE] rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-[#25221E] transition-colors cursor-pointer border border-[#B8966B]/30"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => onAddToCart(product)}
              onViewDetails={() => onViewProduct(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
