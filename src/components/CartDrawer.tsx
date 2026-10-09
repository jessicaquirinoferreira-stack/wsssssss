import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, CreditCard, Zap, MessageCircle } from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { generateWhatsAppCartMessage } from '../lib/infinitepay';
import { OFFICIAL_WHATSAPP_RAW } from '../lib/constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  selectedPaymentMethod?: 'pix' | 'credit_card';
  onChangePaymentMethod?: (method: 'pix' | 'credit_card') => void;
  selectedInstallments?: number;
  onChangeInstallments?: (installments: number) => void;
  settings?: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  selectedPaymentMethod = 'credit_card',
  onChangePaymentMethod,
  selectedInstallments = 12,
  onChangeInstallments,
  settings,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const CREDIT_CARD_FEE_RATE = 0.0899; // 8,99% InfinitePay
  const isCreditCard = selectedPaymentMethod === 'credit_card';
  const cardFee = isCreditCard ? subtotal * CREDIT_CARD_FEE_RATE : 0;
  const estimatedTotal = subtotal + cardFee;
  const safeInstallments = Math.max(1, selectedInstallments || 1);
  const installmentValue = estimatedTotal / safeInstallments;

  // Gerar link do WhatsApp para envio rápido direto da sacola
  const whatsappUrl = generateWhatsAppCartMessage(
    {
      items,
      paymentMethod: selectedPaymentMethod,
      installments: safeInstallments,
      subtotal,
      creditCardFee: cardFee,
      total: estimatedTotal,
      installmentAmount: installmentValue,
    },
    settings?.whatsapp || OFFICIAL_WHATSAPP_RAW
  );

  const handleFinishOnWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#12110F]/65 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF6EE] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[#E7DBC9]">
          
          {/* Header Ébano & Ouro */}
          <div className="p-5 border-b border-[#5C4A33]/30 flex items-center justify-between bg-[#12110F] text-[#FAF6EE]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B8966B]" />
              <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-[#FAF6EE]">Sua Sacola</h2>
              <span className="text-[11px] bg-[#B8966B] text-[#12110F] font-bold px-2 py-0.5 rounded-sm">
                {items.reduce((acc, i) => acc + i.quantity, 0)} {items.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#FAF6EE]/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F4ECE1] flex items-center justify-center text-[#12110F] border border-[#E7DBC9]">
                  <ShoppingBag className="w-8 h-8 text-[#B8966B]" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#12110F] uppercase">Sua sacola está vazia</h3>
                <p className="text-xs text-[#5C4A33] max-w-xs mx-auto">
                  Explore nossos perfumes importados, bolsas de grife, skincare e moda infantil.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-4 rounded-xl border border-[#E7DBC9] bg-white hover:border-[#B8966B] transition-colors shadow-xs"
                >
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=200&q=80'}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-[#F4ECE1] border border-[#E7DBC9] shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#94734B] tracking-wider block">
                        {item.product.brand}
                      </span>
                      <h4 className="font-heading text-sm font-bold text-[#12110F] line-clamp-1 uppercase">
                        {item.product.name}
                      </h4>
                      <p className="font-heading text-sm font-bold text-[#12110F] mt-1">
                        R$ {item.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E7DBC9]">
                      <div className="flex items-center border border-[#E7DBC9] rounded-md bg-[#FAF6EE]">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-[#12110F] hover:text-[#B8966B] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#12110F]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 text-[#12110F] hover:text-[#B8966B] disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E7DBC9] bg-[#F4ECE1] space-y-4">
              
              {/* Seleção do Método de Pagamento e Parcelas no Carrinho */}
              <div className="space-y-2 p-3 bg-white rounded-xl border border-[#E7DBC9] shadow-xs">
                <span className="text-[11px] font-bold text-[#12110F] uppercase tracking-wider block">
                  Escolha a Forma de Pagamento:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onChangePaymentMethod && onChangePaymentMethod('credit_card')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isCreditCard
                        ? 'border-[#B8966B] bg-[#12110F] text-[#FAF6EE] shadow-xs'
                        : 'border-[#E7DBC9] bg-[#FAF6EE] text-[#12110F] hover:border-[#B8966B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <CreditCard className="w-3.5 h-3.5 text-[#B8966B]" />
                      <span>Cartão 12x</span>
                    </div>
                    <p className={`text-[10px] mt-0.5 ${isCreditCard ? 'text-[#E3CEAF]' : 'text-[#5C4A33]'}`}>
                      Taxa 8,99% InfinitePay
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangePaymentMethod && onChangePaymentMethod('pix')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      !isCreditCard
                        ? 'border-[#B8966B] bg-[#12110F] text-[#FAF6EE] shadow-xs'
                        : 'border-[#E7DBC9] bg-[#FAF6EE] text-[#12110F] hover:border-[#B8966B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pix à Vista</span>
                    </div>
                    <p className={`text-[10px] mt-0.5 ${!isCreditCard ? 'text-[#E3CEAF]' : 'text-[#5C4A33]'}`}>
                      Sem taxa adicional
                    </p>
                  </button>
                </div>

                {/* Dropdown de Parcelamento se Cartão Selecionado */}
                {isCreditCard && (
                  <div className="pt-1.5">
                    <label className="block text-[10px] font-bold text-[#5C4A33] uppercase mb-1">
                      Número de Parcelas (com taxa InfinitePay 8,99%):
                    </label>
                    <select
                      value={selectedInstallments}
                      onChange={(e) => onChangeInstallments && onChangeInstallments(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-md border border-[#E7DBC9] bg-[#FAF6EE] text-xs text-[#12110F] outline-none font-medium cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
                        const totalComTaxa = subtotal * (1 + CREDIT_CARD_FEE_RATE);
                        const valorParcela = totalComTaxa / n;
                        return (
                          <option key={n} value={n}>
                            {n}x de R$ {valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Total: R$ {totalComTaxa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Discriminativo Financeiro no Carrinho */}
              <div className="space-y-1.5 text-xs text-[#12110F] pt-1">
                <div className="flex justify-between items-center text-[#5C4A33]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#12110F]">
                    R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {isCreditCard && (
                  <div className="flex justify-between items-center text-[#94734B] font-semibold text-[11px]">
                    <span>Taxa Cartão (8,99% InfinitePay)</span>
                    <span>+ R$ {cardFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-1 border-t border-[#E7DBC9]">
                  <span className="font-bold text-sm text-[#12110F]">Total da Sacola</span>
                  <div className="text-right">
                    <span className="font-heading text-lg font-bold text-[#12110F] block">
                      R$ {estimatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    {isCreditCard && (
                      <span className="text-[11px] text-[#5C4A33] font-medium">
                        em {selectedInstallments}x de R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#5C4A33]">
                  <span>Frete de envio</span>
                  <span>Calculado na próxima etapa</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {/* Botão Primário: Finalizar Pedido no WhatsApp com todo o Resumo Calculado */}
                <button
                  type="button"
                  onClick={handleFinishOnWhatsApp}
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-md font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Finalizar Pedido no WhatsApp</span>
                </button>

                {/* Botão Secundário: Avançar para Checkout com Frete e Endereço */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full py-3 bg-[#12110F] hover:bg-[#25221E] text-[#FAF6EE] rounded-md font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group cursor-pointer border border-[#B8966B]/30"
                >
                  <span>Calcular Frete & Preencher Endereço</span>
                  <ArrowRight className="w-4 h-4 text-[#B8966B] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5C4A33] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>InfinitePay em até 12x ou Pix • Atendimento Salvador-BA</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
