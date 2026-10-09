import React from 'react';
import { 
  CheckCircle, 
  MessageCircle, 
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { generateWhatsAppOrderMessage } from '../lib/infinitepay';
import { OFFICIAL_WHATSAPP_RAW, OFFICIAL_WHATSAPP_FORMATTED } from '../lib/constants';

interface OrderSuccessViewProps {
  order: Order;
  settings: StoreSettings;
  onContinueShopping: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  order,
  settings,
  onContinueShopping
}) => {
  const whatsappUrl = generateWhatsAppOrderMessage(
    order,
    settings.whatsapp || OFFICIAL_WHATSAPP_RAW
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 bg-[#FAF6EE]">
      <div className="w-20 h-20 bg-[#12110F] text-[#B8966B] rounded-full mx-auto flex items-center justify-center shadow-lg border border-[#B8966B]/50 animate-in zoom-in duration-300">
        <CheckCircle className="w-10 h-10 text-[#E3CEAF]" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B8966B]">
          Resumo do Pedido Pronto
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#12110F] uppercase">
          Pedido Gerado com Sucesso!
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4A33] max-w-md mx-auto">
          Seu pedido <strong>#{order.id}</strong> foi registrado. O resumo completo foi preparado para envio ao WhatsApp oficial.
        </p>
      </div>

      {/* Cartão de Detalhes do Pedido */}
      <div className="bg-white p-6 rounded-2xl border border-[#E7DBC9] shadow-xs text-left space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#E7DBC9]">
          <span className="text-xs text-[#5C4A33]">Cliente</span>
          <span className="text-xs font-bold text-[#12110F]">{order.customerName}</span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-[#E7DBC9]">
          <span className="text-xs text-[#5C4A33]">WhatsApp Informado</span>
          <span className="text-xs font-medium text-[#12110F]">{order.customerPhone}</span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-[#E7DBC9]">
          <span className="text-xs text-[#5C4A33]">Destino</span>
          <span className="text-xs font-medium text-[#12110F]">
            {order.shippingAddress.city} - {order.shippingAddress.state} ({order.shippingAddress.cep})
          </span>
        </div>

        {order.shippingOption && (
          <div className="flex justify-between items-center pb-3 border-b border-[#E7DBC9]">
            <span className="text-xs text-[#5C4A33]">Frete ({order.shippingOption.carrier} {order.shippingOption.service})</span>
            <span className="text-xs font-medium text-[#12110F]">
              R$ {order.shippingOption.price.toFixed(2).replace('.', ',')} ({order.shippingOption.deliveryDays} dias úteis)
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pb-3 border-b border-[#E7DBC9]">
          <span className="text-xs text-[#5C4A33]">Forma de Pagamento</span>
          <span className="text-xs font-bold text-[#12110F]">{order.paymentMethod || 'Pix à Vista'}</span>
        </div>

        {order.cardFee !== undefined && order.cardFee > 0 && (
          <div className="flex justify-between items-center pb-3 border-b border-[#E7DBC9]">
            <span className="text-xs text-[#5C4A33]">Taxa InfinitePay (8,99%)</span>
            <span className="text-xs font-semibold text-amber-800">
              + R$ {order.cardFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {order.installments !== undefined && order.installments > 0 && (
          <div className="flex justify-between items-center pb-3 border-b border-[#E7DBC9]">
            <span className="text-xs text-[#5C4A33]">Condição Escolhida</span>
            <span className="text-xs font-bold text-[#12110F]">
              {order.installments}x de R$ {(order.installmentAmount || (order.total / order.installments)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pb-3 border-b border-[#E7DBC9]">
          <span className="text-xs text-[#5C4A33]">Total a Pagar</span>
          <span className="font-heading text-lg font-bold text-[#12110F]">
            R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Botão Primário WhatsApp */}
        <div className="pt-2 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Enviar Resumo no WhatsApp {OFFICIAL_WHATSAPP_FORMATTED}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5C4A33]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Envie a mensagem pronta no WhatsApp para confirmar o pedido e receber a chave Pix ou link de cartão</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onContinueShopping}
          className="text-xs uppercase font-bold tracking-wider text-[#12110F] hover:text-[#B8966B] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continuar Comprando na Loja</span>
          <ArrowRight className="w-4 h-4 text-[#B8966B]" />
        </button>
      </div>
    </div>
  );
};
