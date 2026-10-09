import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Tag, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  MessageCircle, 
  Loader2,
  QrCode
} from 'lucide-react';
import { CartItem, CustomerAddress, Order, ShippingOption, StoreSettings, Coupon } from '../types';
import { fetchAddressByCep, calculateShippingOptions } from '../lib/shipping';
import { generateInfinitePayCheckoutUrl, generateWhatsAppOrderMessage } from '../lib/infinitepay';
import { saveOrder } from '../lib/storeService';
import confetti from 'canvas-confetti';

interface CheckoutViewProps {
  items: CartItem[];
  settings: StoreSettings;
  coupons: Coupon[];
  onBackToShop: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  items,
  settings,
  coupons,
  onBackToShop,
  onOrderSuccess
}) => {
  // Identificação do Cliente
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');

  // Endereço de Entrega
  const [cep, setCep] = React.useState('');
  const [loadingCep, setLoadingCep] = React.useState(false);
  const [address, setAddress] = React.useState<CustomerAddress>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Frete
  const [shippingOptions, setShippingOptions] = React.useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = React.useState<ShippingOption | null>(null);

  // Cupom
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [couponError, setCouponError] = React.useState('');

  // Método de pagamento e parcelamento
  const [paymentMethod, setPaymentMethod] = React.useState<'pix' | 'credit_card'>('pix');
  const [installments, setInstallments] = React.useState<number>(1);

  // Status de submissão
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  // Cálculos financeiros
  const subtotal = items.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);
  const totalWeight = items.reduce((acc, i) => acc + ((i.product.weightGrams || 500) * i.quantity), 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const baseTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Taxa de 8,99% da operadora InfinitePay para Cartão de Crédito
  const INFINITEPAY_FEE_PERCENT = 0.0899;
  const isCreditCard = paymentMethod === 'credit_card';
  const cardFee = isCreditCard ? Math.round(baseTotal * INFINITEPAY_FEE_PERCENT * 100) / 100 : 0;
  const grandTotal = isCreditCard ? Math.round((baseTotal + cardFee) * 100) / 100 : baseTotal;
  const currentInstallments = isCreditCard ? installments : 1;
  const installmentAmount = Math.round((grandTotal / currentInstallments) * 100) / 100;

  // Lista de 1x até 12x calculadas com a taxa de 8,99%
  const installmentOptions = React.useMemo(() => {
    const list = [];
    const totalComTaxa = Math.round((baseTotal * (1 + INFINITEPAY_FEE_PERCENT)) * 100) / 100;
    for (let i = 1; i <= 12; i++) {
      const parcela = Math.round((totalComTaxa / i) * 100) / 100;
      list.push({
        times: i,
        amount: parcela,
        total: totalComTaxa
      });
    }
    return list;
  }, [baseTotal]);

  // Busca CEP automático via ViaCEP
  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    setErrorMsg('');
    try {
      const fetched = await fetchAddressByCep(cleanCep);
      if (fetched) {
        setAddress(prev => ({
          ...prev,
          cep: fetched.cep,
          street: fetched.street,
          neighborhood: fetched.neighborhood,
          city: fetched.city,
          state: fetched.state
        }));

        // Calcular cotações de frete Jadlog / Correios a partir de Salvador-BA
        const originCep = settings.cepOrigin || '41635000';
        const options = await calculateShippingOptions(originCep, cleanCep, totalWeight, subtotal);
        setShippingOptions(options);
        if (options.length > 0) {
          setSelectedShipping(options[0]); // Seleciona o melhor/mais rápido por padrão
        }
      } else {
        setErrorMsg('CEP não localizado. Por favor, verifique os dígitos digitados.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Não foi possível consultar o CEP. Preencha seu endereço manualmente.');
    } finally {
      setLoadingCep(false);
    }
  };

  // Aplicação de Cupom
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const found = coupons.find(c => c.code.toUpperCase() === code && c.active);
    if (!found) {
      setCouponError('Cupom inválido ou expirado.');
      setAppliedCoupon(null);
      return;
    }

    if (found.minOrderValue && subtotal < found.minOrderValue) {
      setCouponError(`Este cupom exige pedido mínimo de R$ ${found.minOrderValue.toFixed(2)}.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(found);
  };

  // Validação e Envio para WhatsApp com Resumo Completo
  const handleProceedPayment = async () => {
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Por favor, informe seu Nome Completo.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor, informe seu WhatsApp para acompanhamento do pedido.');
      return;
    }
    if (!address.cep || !address.street || !address.number || !address.city || !address.state) {
      setErrorMsg('Por favor, complete todos os dados de entrega (CEP, Rua, Número, Cidade e UF).');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `ORD-${Date.now()}`;

      const defaultShipping: ShippingOption = {
        carrier: 'Correios',
        service: 'PAC',
        price: 0,
        deliveryDays: 5,
        description: 'Envio Seguro com Rastreio'
      };

      const orderData: Order = {
        id: orderId,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        shippingAddress: address,
        shippingOption: selectedShipping || defaultShipping,
        items: items.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          productImage: i.product.images[0] || '',
          price: i.product.price,
          quantity: i.quantity
        })),
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        shippingCost,
        total: grandTotal,
        paymentMethod: isCreditCard ? 'Cartão de Crédito (InfinitePay)' : 'Pix à Vista',
        cardFee: isCreditCard ? cardFee : 0,
        installments: isCreditCard ? installments : 1,
        installmentAmount: installmentAmount,
        status: 'pendente',
        createdAt: new Date().toISOString()
      };

      // Gerar link formatado do WhatsApp oficial (71) 98217-2459 com resumo completo
      const whatsappUrl = generateWhatsAppOrderMessage(
        orderData,
        settings.whatsapp || '5571982172459'
      );
      orderData.paymentUrl = whatsappUrl;

      // Salvar no Firebase Firestore (com timeout para garantir que o cliente não fique travado)
      try {
        await Promise.race([
          saveOrder(orderData),
          new Promise((resolve) => setTimeout(resolve, 1500))
        ]);
      } catch (e) {
        console.warn('Erro ao salvar no Firestore, prosseguindo com WhatsApp:', e);
      }

      // Efeito de celebração
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Atualizar o estado da aplicação para a tela de sucesso
      onOrderSuccess(orderData);

      // Enviar imediatamente para o WhatsApp via wa.me (sem bloqueio de popup)
      try {
        window.location.href = whatsappUrl;
      } catch (e) {
        console.warn('Redirecionamento direto:', e);
      }

    } catch (err: any) {
      console.error('Erro ao processar pedido:', err);
      setErrorMsg('Houve uma instabilidade ao salvar o pedido. Tente novamente ou chame no WhatsApp oficial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FAF6EE]">
      {/* Botão Voltar */}
      <button
        onClick={onBackToShop}
        className="flex items-center gap-2 text-[#12110F] hover:text-[#B8966B] text-xs font-semibold uppercase tracking-wider mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para as compras</span>
      </button>

      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#12110F] uppercase">
          Finalização de Pedido Seguro
        </h1>
        <p className="text-sm text-[#5C4A33] mt-1">
          Complete seus dados de entrega para envio a partir de Salvador-BA e prossiga para o checkout seguro.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Formulário Principal de Entrega e Pagamento */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Seção 1: Dados Pessoais */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7DBC9] shadow-xs space-y-4 overflow-hidden">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#12110F]">
              <span className="w-6 h-6 rounded-full bg-[#12110F] text-[#FAF6EE] text-xs flex items-center justify-center font-mono">1</span>
              <span>Identificação do Cliente</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs">
              <div className="sm:col-span-2 min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo para nota e envio"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Endereço de Entrega */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7DBC9] shadow-xs space-y-4 overflow-hidden">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#12110F]">
              <span className="w-6 h-6 rounded-full bg-[#12110F] text-[#FAF6EE] text-xs flex items-center justify-center font-mono">2</span>
              <span>Endereço de Entrega</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 text-xs">
              <div className="sm:col-span-8 min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  CEP de Destino *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="00000-000"
                    maxLength={9}
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    onBlur={handleCepBlur}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                  />
                  {loadingCep && (
                    <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-[#B8966B]" />
                  )}
                </div>
              </div>

              <div className="sm:col-span-4 min-w-0 flex items-end">
                <button
                  type="button"
                  onClick={handleCepBlur}
                  className="w-full py-2.5 bg-[#FAF6EE] hover:bg-white text-[#12110F] font-semibold text-xs border border-[#E7DBC9] rounded-lg transition-colors cursor-pointer"
                >
                  Buscar CEP
                </button>
              </div>

              <div className="sm:col-span-8 md:col-span-9 min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  Logradouro / Rua *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Av. Sete de Setembro"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                />
              </div>

              <div className="sm:col-span-4 md:col-span-3 min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                />
              </div>

              <div className="sm:col-span-6 min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  placeholder="Apto 402, Bloco B (opcional)"
                  value={address.complement}
                  onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                />
              </div>

              <div className="sm:col-span-6 min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  placeholder="Bairro"
                  value={address.neighborhood}
                  onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                />
              </div>

              <div className="sm:col-span-8 md:col-span-9 min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  placeholder="Cidade"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none text-[#12110F]"
                />
              </div>

              <div className="sm:col-span-4 md:col-span-3 min-w-0">
                <label className="block text-xs font-semibold text-[#12110F] mb-1">
                  Estado (UF) *
                </label>
                <input
                  type="text"
                  placeholder="UF"
                  maxLength={2}
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E7DBC9] focus:border-[#B8966B] outline-none uppercase text-center font-bold text-[#12110F]"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Seleção de Frete */}
          {shippingOptions.length > 0 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7DBC9] shadow-xs space-y-4 overflow-hidden">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#12110F]">
                <span className="w-6 h-6 rounded-full bg-[#12110F] text-[#FAF6EE] text-xs flex items-center justify-center font-mono">3</span>
                <span>Opções de Envio Disponíveis</span>
              </div>

              <div className="space-y-3">
                {shippingOptions.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedShipping?.service === opt.service
                        ? 'border-[#B8966B] bg-[#F4ECE1]'
                        : 'border-[#E7DBC9] hover:border-[#B8966B]/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping?.service === opt.service}
                        onChange={() => setSelectedShipping(opt)}
                        className="text-[#B8966B]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase text-[#12110F]">{opt.carrier} {opt.service}</span>
                        </div>
                        <p className="text-[11px] text-[#5C4A33]">Prazo estimado: {opt.deliveryDays} dias úteis</p>
                      </div>
                    </div>
                    <span className="font-heading text-sm font-bold text-[#12110F]">
                      R$ {opt.price.toFixed(2).replace('.', ',')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Seção 4: Seleção do Método de Pagamento (Pix ou Cartão InfinitePay com taxa de 8,99%) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7DBC9] shadow-xs space-y-5 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#12110F]">
                <span className="w-6 h-6 rounded-full bg-[#12110F] text-[#FAF6EE] text-xs flex items-center justify-center font-mono">
                  {shippingOptions.length > 0 ? '4' : '3'}
                </span>
                <span>Escolha a Forma de Pagamento</span>
              </div>
              <span className="text-[11px] font-semibold text-[#B8966B] bg-[#F4ECE1] px-2.5 py-1 rounded-md border border-[#E7DBC9]">
                Operadora InfinitePay
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Opção 1: Pix à Vista */}
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'pix'
                    ? 'border-[#B8966B] bg-[#F4ECE1]/60 shadow-xs ring-1 ring-[#B8966B]/50'
                    : 'border-[#E7DBC9] hover:border-[#B8966B]/40 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider text-[#12110F] block">
                        Pix à Vista
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Aprovação Imediata • Sem Taxas
                      </span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                    paymentMethod === 'pix' ? 'border-[#B8966B] bg-[#B8966B]' : 'border-stone-300'
                  }`}>
                    {paymentMethod === 'pix' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E7DBC9]/60 flex justify-between items-baseline">
                  <span className="text-[11px] text-[#5C4A33]">Valor à vista:</span>
                  <span className="font-heading text-base font-bold text-[#12110F]">
                    R$ {baseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>

              {/* Opção 2: Cartão de Crédito (InfinitePay) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'credit_card'
                    ? 'border-[#B8966B] bg-[#F4ECE1]/60 shadow-xs ring-1 ring-[#B8966B]/50'
                    : 'border-[#E7DBC9] hover:border-[#B8966B]/40 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider text-[#12110F] block">
                        Cartão de Crédito
                      </span>
                      <span className="text-[11px] text-[#B8966B] font-semibold">
                        Operadora InfinitePay • Até 12x
                      </span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                    paymentMethod === 'credit_card' ? 'border-[#B8966B] bg-[#B8966B]' : 'border-stone-300'
                  }`}>
                    {paymentMethod === 'credit_card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E7DBC9]/60 flex justify-between items-baseline">
                  <span className="text-[11px] text-[#5C4A33]">Taxa de 8,99%:</span>
                  <span className="font-heading text-base font-bold text-[#12110F]">
                    R$ {(baseTotal * (1 + INFINITEPAY_FEE_PERCENT)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>
            </div>

            {/* Painel de Seleção de Parcelas InfinitePay */}
            {paymentMethod === 'credit_card' && (
              <div className="p-4 bg-[#FAF6EE] rounded-xl border border-[#B8966B]/40 space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#12110F] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#B8966B]" />
                    <span>Quantidade de Parcelas:</span>
                  </label>
                  <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-md border border-amber-300">
                    Taxa InfinitePay 8,99% inclusa no cálculo
                  </span>
                </div>

                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full px-3.5 py-3 rounded-lg border border-[#E7DBC9] bg-white text-xs font-semibold text-[#12110F] focus:border-[#B8966B] outline-none shadow-xs cursor-pointer"
                >
                  {installmentOptions.map((opt) => (
                    <option key={opt.times} value={opt.times}>
                      {opt.times}x de R$ {opt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Total: R$ {opt.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="text-[11px] text-[#5C4A33] flex justify-between">
                    <span>Valor base da compra + frete:</span>
                    <span className="font-medium">R$ {baseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-[11px] text-amber-800 flex justify-between">
                    <span>Taxa de crédito da operadora InfinitePay (8,99%):</span>
                    <span className="font-bold">+ R$ {cardFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-[#12110F] font-bold flex justify-between pt-2 border-t border-[#E7DBC9]">
                    <span>Total parcelado no cartão:</span>
                    <span className="font-heading text-sm text-[#12110F]">
                      {installments}x de R$ {installmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Resumo do Pedido Lateral */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-[#E7DBC9] shadow-sm sticky top-28 space-y-6">
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-[#12110F] pb-3 border-b border-[#E7DBC9]">
              Resumo da Compra
            </h3>

            {/* Lista dos Itens */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={i.product.images[0] || ''}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-[#F4ECE1] border border-[#E7DBC9] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#12110F] truncate">{i.product.name}</p>
                    <p className="text-[#5C4A33] text-[11px]">{i.quantity}x R$ {i.product.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <span className="font-semibold text-[#12110F] font-heading text-sm">
                    R$ {(i.product.price * i.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            {/* Cupom de Desconto */}
            <div className="pt-2 border-t border-[#E7DBC9]">
              <label className="block text-xs font-semibold text-[#12110F] mb-1">
                Cupom de Desconto
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: PRIMEIRACOMPRA"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs uppercase font-mono rounded-md border border-[#E7DBC9] focus:border-[#B8966B] outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-[#12110F] hover:bg-[#25221E] text-[#FAF6EE] rounded-md text-xs font-semibold uppercase transition-colors cursor-pointer border border-[#B8966B]/30"
                >
                  Aplicar
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Cupom {appliedCoupon.code} aplicado com sucesso!</span>
                </div>
              )}
              {couponError && (
                <div className="mt-2 text-[11px] text-rose-600">
                  {couponError}
                </div>
              )}
            </div>

            {/* Discriminativo de Valores */}
            <div className="space-y-2 text-xs border-t border-[#E7DBC9] pt-4 text-[#5C4A33]">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} itens)</span>
                <span className="font-semibold text-[#12110F]">
                  R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto ({appliedCoupon?.code})</span>
                  <span>- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frete ({selectedShipping ? `${selectedShipping.carrier} ${selectedShipping.service}` : 'A calcular'})</span>
                <span className="font-semibold text-[#12110F]">
                  {selectedShipping ? (
                    `R$ ${selectedShipping.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  ) : (
                    'R$ 0,00'
                  )}
                </span>
              </div>

              {/* Destaque do Método de Pagamento Selecionado */}
              {isCreditCard ? (
                <div className="flex justify-between text-amber-900 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <span className="flex items-center gap-1">
                    <span>Taxa Cartão InfinitePay (8,99%)</span>
                  </span>
                  <span>+ R$ {cardFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-[11px]">
                  <span>Forma de Pagamento</span>
                  <span>Pix à Vista (Sem taxa adicional)</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-[#E7DBC9]">
                <span className="text-sm font-bold text-[#12110F]">Total a Pagar</span>
                <div className="text-right">
                  <span className="font-heading text-2xl font-bold text-[#12110F] block">
                    R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-[#5C4A33]">
                    {isCreditCard ? (
                      <span className="font-semibold text-amber-800">
                        em {installments}x de R$ {installmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no cartão
                      </span>
                    ) : (
                      'no Pix à vista com aprovação imediata'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão de Finalização com WhatsApp Direto */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleProceedPayment}
              className="w-full py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-md font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Enviando Pedido para o WhatsApp...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-white fill-current" />
                  <span>
                    {isCreditCard 
                      ? `Finalizar Pedido no WhatsApp (${installments}x no Cartão)` 
                      : 'Finalizar Pedido no WhatsApp (Pix à Vista)'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <div className="p-3 bg-[#F4ECE1] rounded-xl border border-[#E7DBC9] text-[11px] text-[#5C4A33] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#12110F]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Atendimento Direto: (71) 98217-2459</span>
              </div>
              <p>
                {isCreditCard ? (
                  <span>
                    Ao clicar no botão, o resumo completo do pedido já com a <strong>taxa de 8,99% da InfinitePay</strong> no plano de <strong>{installments}x de R$ {installmentAmount.toFixed(2).replace('.', ',')}</strong> será enviado diretamente para o WhatsApp oficial para envio do link seguro InfinitePay.
                  </span>
                ) : (
                  <span>
                    Ao clicar no botão, o resumo completo do pedido será enviado diretamente para o WhatsApp oficial para envio da chave Pix com confirmação imediata.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
