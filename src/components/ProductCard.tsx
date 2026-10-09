import React from 'react';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails
}) => {
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="group relative bg-white border border-[#E7DBC9] rounded-xl overflow-hidden hover:shadow-xl hover:border-[#B8966B] transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Imagem Container com proporção de luxo */}
      <div className="relative aspect-square w-full bg-[#F4ECE1] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges Ouro & Ébano */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="bg-[#12110F] text-[#FAF6EE] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm shadow-sm border border-[#B8966B]/30">
              Destaque
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-[#B8966B] text-[#12110F] text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
              -{discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Categoria Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-white/95 backdrop-blur-sm text-[#12110F] text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-sm border border-[#E7DBC9]">
            {product.category}
          </span>
        </div>

        {/* Hover Quick Action */}
        <div className="absolute inset-0 bg-[#12110F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="w-10 h-10 rounded-full bg-white text-[#12110F] flex items-center justify-center hover:bg-[#B8966B] hover:text-[#12110F] transition-colors shadow-lg"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Container: Tipografia Marcellus, tons Ébano e Ouro */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-center">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#94734B] font-semibold block mb-1">
            {product.brand}
          </span>
          <h3 className="font-heading text-base sm:text-lg font-bold text-[#12110F] line-clamp-2 group-hover:text-[#B8966B] transition-colors leading-snug uppercase">
            {product.name}
          </h3>
          <p className="text-xs text-[#5C4A33] line-clamp-2 mt-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Preço e Botão */}
        <div className="mt-4 pt-3 border-t border-[#E7DBC9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#94734B] line-through block">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-[#5C4A33]">R$</span>
              <span className="font-heading text-xl font-bold text-[#12110F]">
                {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-[#5C4A33] font-medium block">
              12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 text-xs uppercase tracking-wider font-semibold cursor-pointer border border-[#B8966B]/30 ${
              product.stock <= 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-[#12110F] hover:bg-[#25221E] text-[#FAF6EE]'
            }`}
            title={product.stock <= 0 ? 'Esgotado' : 'Comprar'}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-[#B8966B]" />
                <span>Adicionado</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-[#B8966B]" />
                <span>Comprar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
