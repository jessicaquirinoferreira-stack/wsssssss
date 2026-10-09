import { Order } from '../types';
import { OFFICIAL_WHATSAPP_RAW } from './constants';

/**
 * Cria a URL de Checkout InfinitePay oficial (opcional)
 */
export function generateInfinitePayCheckoutUrl(
  infinitePayHandle: string,
  order: Order
): string {
  const cleanHandle = infinitePayHandle.replace(/^@/, '').replace(/^\$/, '').trim();
  const handle = cleanHandle || 'dsdreamshopping_ba';
  
  const amountInCents = Math.round(order.total * 100);
  const orderDescription = encodeURIComponent(
    `Pedido Dream Shopping #${order.id.slice(-6).toUpperCase()} (${order.items.length} itens)`
  );
  
  return `https://pay.infinitepay.io/${handle}?amount=${amountInCents}&description=${orderDescription}&order_id=${order.id}&customer_name=${encodeURIComponent(order.customerName)}&customer_phone=${encodeURIComponent(order.customerPhone)}`;
}

/**
 * Gera mensagem formatada e completa para WhatsApp oficial (71) 98217-2459 via wa.me
 * contendo todos os dados do cliente, produtos, frete, taxa InfinitePay de 8,99% se cartão,
 * parcelas selecionadas, valores detalhados e endereço de entrega.
 */
export function generateWhatsAppOrderMessage(
  order: Order,
  whatsappNumber: string = OFFICIAL_WHATSAPP_RAW
): string {
  const itemsText = order.items
    .map((i, index) => `${index + 1}. *${i.quantity}x ${i.productName}*\n   ↳ R$ ${(i.price * i.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    .join('\n');

  const discountLine = order.discount && order.discount > 0
    ? `🎁 *Desconto (${order.couponCode || 'Cupom'}):* -R$ ${order.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`
    : '';

  const shippingDetails = order.shippingOption
    ? `${order.shippingOption.carrier} (${order.shippingOption.service}) — R$ ${order.shippingOption.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${order.shippingOption.deliveryDays} dias úteis)`
    : 'A combinar';

  const orderCode = order.id.startsWith('ORD-') 
    ? order.id.replace('ORD-', '') 
    : order.id.slice(-6).toUpperCase();

  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const isCreditCard = (order.paymentMethod || '').toLowerCase().includes('cart') || 
                       (order.paymentMethod || '').toLowerCase().includes('credit') ||
                       (order.installments && order.installments > 0 && order.cardFee !== undefined);

  const paymentDetails = isCreditCard
    ? `💳 *MÉTODO DE PAGAMENTO ESCOLHIDO:*
• *Forma:* Cartão de Crédito (Operadora InfinitePay)
• *Taxa Operadora (8,99%):* + R$ ${(order.cardFee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• *Parcelamento:* ${order.installments || 1}x de R$ ${(order.installmentAmount || order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• *Total Final com Taxa:* R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `💳 *MÉTODO DE PAGAMENTO ESCOLHIDO:*
• *Forma:* Pix à Vista (Sem taxa adicional)
• *Condição:* Pagamento à vista com confirmação imediata
• *Total Final:* R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const closingMessage = isCreditCard
    ? `Olá! Acabei de montar meu pedido pelo site Dream Shopping no valor total de R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} e escolhi pagar no *Cartão de Crédito em ${order.installments || 1}x de R$ ${(order.installmentAmount || order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*. Aguardo o link de pagamento seguro da InfinitePay para eu concluir minha compra!`
    : `Olá! Acabei de montar meu pedido pelo site Dream Shopping no valor total de R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} e escolhi pagar via *Pix à Vista*. Por favor, me enviem a chave Pix para eu realizar o pagamento e confirmar meu pedido!`;

  const text = `🛍️ *NOVO PEDIDO - DREAM SHOPPING*
━━━━━━━━━━━━━━━━━━━━
🔖 *Código do Pedido:* #${orderCode}
📅 *Data:* ${formattedDate} às ${formattedTime}

👤 *DADOS DO CLIENTE:*
• *Nome:* ${order.customerName}
• *WhatsApp:* ${order.customerPhone}
${order.customerEmail ? `• *E-mail:* ${order.customerEmail}\n` : ''}
📦 *ITENS DO PEDIDO:*
${itemsText}

💰 *RESUMO FINANCEIRO:*
• *Subtotal:* R$ ${order.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${discountLine}• *Frete:* ${shippingDetails}
${isCreditCard && order.cardFee ? `• *Taxa InfinitePay (8,99%):* + R$ ${order.cardFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` : ''}• *TOTAL DO PEDIDO: R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*

${paymentDetails}

📍 *ENDEREÇO DE ENTREGA:*
• *Rua:* ${order.shippingAddress.street}, Nº ${order.shippingAddress.number}${order.shippingAddress.complement ? ` (${order.shippingAddress.complement})` : ''}
• *Bairro:* ${order.shippingAddress.neighborhood}
• *Cidade/UF:* ${order.shippingAddress.city} - ${order.shippingAddress.state}
• *CEP:* ${order.shippingAddress.cep}

━━━━━━━━━━━━━━━━━━━━
${closingMessage}`;

  let cleanPhone = (whatsappNumber || OFFICIAL_WHATSAPP_RAW).replace(/\D/g, '');
  if (!cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
    cleanPhone = `55${cleanPhone}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
