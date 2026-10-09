import React from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Check, 
  MessageCircle
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductDetailViewProps {
  product: Product;
  settings: StoreSettings;
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
  onOpenCart: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  settings,
  onAddToCart,
  onBack,
  onOpenCart
}) => {
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FAF6EE]">
      {/* Navegação Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#12110F] hover:text-[#B8966B] text-xs font-semibold uppercase tracking-wider mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao catálogo</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Galeria de Fotos */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F4ECE1] border border-[#E7DBC9] shadow-sm">
            <img
              src={product.images[selectedImage] || product.images[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-[#B8966B] text-[#12110F] text-xs font-bold px-3 py-1 rounded-sm shadow-sm uppercase tracking-wider">
                -{discount}% OFF
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === idx ? 'border-[#B8966B] scale-105 shadow-sm' : 'border-[#E7DBC9] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes do Produto */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#B8966B]">
              {product.brand} • {product.category}
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#12110F] mt-1 uppercase">
              {product.name}
            </h1>
          </div>

          {/* Preço */}
          <div className="p-4 rounded-xl bg-[#F4ECE1] border border-[#E7DBC9] space-y-1">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#94734B] line-through block">
                De: R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-[#12110F]">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-[#12110F] font-semibold bg-[#E3CEAF] px-2.5 py-0.5 rounded-sm border border-[#B8966B]/30">
                12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <p className="text-[11px] text-[#5C4A33] mt-1">
              Envio seguro para todo o Brasil • 10% OFF no 1º Pedido com cupom <strong>PRIMEIRACOMPRA</strong>
            </p>
          </div>

          {/* Quantidade e Adição */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E7DBC9] rounded-md px-3 py-1.5 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 text-[#12110F] hover:text-[#B8966B] font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-[#12110F]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-2 text-[#12110F] hover:text-[#B8966B] font-bold disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="text-xs text-[#5C4A33]">
                {product.stock > 0 ? (
                  <span className="text-emerald-700 font-semibold">
                    {product.stock} {product.stock === 1 ? 'unidade em estoque' : 'unidades em estoque'}
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold">Produto Esgotado</span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={`flex-1 py-4 rounded-md font-semibold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#B8966B]/30 ${
                  product.stock <= 0
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#12110F] hover:bg-[#25221E] text-[#FAF6EE] active:scale-95'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-[#B8966B]" />
                    <span>Adicionado à Sacola!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#B8966B]" />
                    <span>Adicionar à Sacola</span>
                  </>
                )}
              </button>

              <a
                href={`${settings.whatsapp}?text=Olá! Tenho interesse no produto: ${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-6 border border-[#E7DBC9] hover:bg-white text-[#12110F] rounded-md font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Dúvidas</span>
              </a>
            </div>
          </div>

          {/* Descrição e Especificações */}
          <div className="space-y-4 pt-4 border-t border-[#E7DBC9] text-xs">
            <div>
              <h4 className="font-heading text-sm font-bold text-[#12110F] uppercase mb-1">
                Descrição do Produto
              </h4>
              <p className="text-[#5C4A33] leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.specifications && (
              <div>
                <h4 className="font-heading text-sm font-bold text-[#12110F] uppercase mb-1">
                  Especificações Técnicas
                </h4>
                <p className="text-[#5C4A33] leading-relaxed font-mono text-[11px] bg-[#F4ECE1] p-3 rounded-lg border border-[#E7DBC9]">
                  {product.specifications}
                </p>
              </div>
            )}
          </div>

          {/* Selos Garantia */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E7DBC9] text-[11px] text-[#5C4A33]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B8966B]" />
              <span>100% Original e Lacrado</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B8966B]" />
              <span>Envio com Seguro Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
