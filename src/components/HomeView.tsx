import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  MessageCircle, 
  Star, 
  CreditCard,
  Gift
} from 'lucide-react';
import { Product, StoreSettings, Category } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORY_ICONS } from '../lib/themeIcons';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onNavigateCategory: (category: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  settings,
  onAddToCart,
  onViewProduct,
  onNavigateCategory,
}) => {
  const featuredProducts = products.filter(p => p.featured && p.active).slice(0, 8);

  const activeCategories = (categories || []).filter(c => c.active && c.id !== 'k-beauty' && !c.name.toLowerCase().includes('k-beauty'));

  const testimonials = [
    {
      name: 'Camila Mendonça',
      location: 'Salvador, BA',
      text: 'Comprei a bolsa Michael Kors e o perfume Baccarat Rouge. Chegou impecável em apenas 2 dias! Caixa lacrada, com certificado e brinde maravilhoso. Apaixonada pela loja!',
      rating: 5,
      product: 'Michael Kors Jet Set + Baccarat 540'
    },
    {
      name: 'Larissa Alencar',
      location: 'São Paulo, SP',
      text: 'O dispositivo Medicube Age-R Booster mudou minha pele. Minha dermatologista aprovou o resultado. O atendimento pelo WhatsApp foi nota 1000 e entrega rápida.',
      rating: 5,
      product: 'Medicube Age-R Booster Pro'
    },
    {
      name: 'Fernanda Vasconcelos',
      location: 'Belo Horizonte, MG',
      text: 'Produtos 100% originais mesmo! O perfume é exatamente o importado francês com fixação espetacular. O site é lindo e muito fácil de comprar.',
      rating: 5,
      product: 'Creed Aventus EDP'
    }
  ];

  return (
    <div className="space-y-16 pb-20 bg-[#FAF6EE]">
      
      {/* 1. Banner Informativo Triplo com Tom Ouro & Ébano das Imagens */}
      <section className="border-b border-[#E7DBC9] bg-[#F4ECE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E7DBC9]">
            
            {/* 1. Cupom de Boas-Vindas */}
            <div className="flex items-center justify-center py-3.5 px-3 sm:px-4">
              <div className="flex items-center gap-4 w-full max-w-[340px]">
                <div className="w-12 h-12 rounded-full bg-[#12110F] text-[#B8966B] flex items-center justify-center shrink-0 shadow-sm border border-[#5C4A33]/40">
                  <Gift className="w-5 h-5 text-[#E3CEAF]" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#12110F] leading-tight">
                    10% OFF no 1º Pedido
                  </h4>
                  <p className="text-xs text-[#5C4A33] mt-0.5 leading-snug">
                    Use o cupom: <strong className="text-[#12110F]">PRIMEIRACOMPRA</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Envio Seguro */}
            <div className="flex items-center justify-center py-3.5 px-3 sm:px-4">
              <div className="flex items-center gap-4 w-full max-w-[340px]">
                <div className="w-12 h-12 rounded-full bg-[#12110F] text-[#B8966B] flex items-center justify-center shrink-0 shadow-sm border border-[#5C4A33]/40">
                  <Truck className="w-5 h-5 text-[#E3CEAF]" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#12110F] leading-tight">
                    Envio com Seguro
                  </h4>
                  <p className="text-xs text-[#5C4A33] mt-0.5 leading-snug">
                    Correios e Transportadoras com rastreamento
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Parcelamento */}
            <div className="flex items-center justify-center py-3.5 px-3 sm:px-4">
              <div className="flex items-center gap-4 w-full max-w-[340px]">
                <div className="w-12 h-12 rounded-full bg-[#12110F] text-[#B8966B] flex items-center justify-center shrink-0 shadow-sm border border-[#5C4A33]/40">
                  <CreditCard className="w-5 h-5 text-[#E3CEAF]" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#12110F] leading-tight">
                    Parcele em até 12x
                  </h4>
                  <p className="text-xs text-[#5C4A33] mt-0.5 leading-snug">
                    Cartão de Crédito ou Pix com confirmação
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Hero Section com Ouro Nobre e Ébano (#12110F & #B8966B) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4ECE1] to-[#FAF6EE] border-b border-[#E7DBC9] pt-10 sm:pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#12110F] text-[#FAF6EE] text-xs tracking-wider uppercase font-semibold border border-[#B8966B]/30 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#B8966B]" />
                <span>Boutique de Alto Luxo 100% Original</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-[#12110F] leading-[1.1] uppercase">
                O Luxo dos Importados <br />
                <span className="text-[#B8966B] font-normal normal-case">ao seu alcance.</span>
              </h1>

              <p className="text-[#5C4A33] text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Fragrâncias importadas exclusivas, cosméticos capilares, bolsas de grife Michael Kors, tratamentos de Skin Care e moda Baby & Kids. Procedência autêntica e envio seguro.
              </p>

              {/* Botões CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigateCategory('todos')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#12110F] hover:bg-[#25221E] text-[#FAF6EE] rounded-md font-semibold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer border border-[#B8966B]/30"
                >
                  <span>Explorar Coleção Completa</span>
                  <ArrowRight className="w-4 h-4 text-[#B8966B] group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href={settings.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-4 bg-[#FAF6EE] hover:bg-white border border-[#B8966B]/50 text-[#12110F] rounded-md font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Consultoria no WhatsApp</span>
                </a>
              </div>

              {/* Selos Hero */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E7DBC9] max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <span className="font-heading text-2xl font-bold text-[#12110F] block">100%</span>
                  <span className="text-[11px] text-[#5C4A33] uppercase tracking-wider">Originais</span>
                </div>
                <div>
                  <span className="font-heading text-2xl font-bold text-[#12110F] block">12x</span>
                  <span className="text-[11px] text-[#5C4A33] uppercase tracking-wider">Sem Segredos</span>
                </div>
                <div>
                  <span className="font-heading text-2xl font-bold text-[#12110F] block">Brasil</span>
                  <span className="text-[11px] text-[#5C4A33] uppercase tracking-wider">Envio Seguro</span>
                </div>
              </div>
            </div>

            {/* Imagem Hero com moldura em tons quentes e borda ouro */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#12110F]/10">
                  <img
                    src={settings.heroImageUrl || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85"}
                    alt="Dream Shopping Perfumes e Bolsas"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Seção de Departamentos COM OS ÍCONES EXATOS FORNECIDOS EM CADA LOCAL CORRETO! */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#B8966B] block mb-1">
            Departamentos Exclusivos
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#12110F] uppercase">
            Navegue por Categoria
          </h2>
          <div className="w-16 h-0.5 bg-[#B8966B] mx-auto mt-2"></div>
        </div>

        {/* Grid com os 6 ícones nos seus respectivos locais perfeitos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {activeCategories.map((cat) => {
            // Prioridade total para URL do ícone cadastrado na categoria, depois mapa padrão
            const iconUrl = cat.iconUrl || cat.image || CATEGORY_ICONS[cat.id] || CATEGORY_ICONS[cat.name?.toLowerCase()] || CATEGORY_ICONS.perfumes;
            
            return (
              <div
                key={cat.id}
                onClick={() => onNavigateCategory(cat.id)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-[#E7DBC9] shadow-xs hover:shadow-xl transition-all duration-300 bg-white hover:bg-[#F8F3EA] flex flex-col items-center text-center p-5 hover:border-[#B8966B]"
              >
                {/* Medalha / Ícone do Usuário perfeitamente enquadrado */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#B8966B] mb-3 group-hover:scale-105 transition-transform duration-300 shadow-md bg-[#12110F]">
                  <img
                    src={iconUrl}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-heading text-sm sm:text-base font-bold text-[#12110F] group-hover:text-[#B8966B] transition-colors uppercase leading-snug">
                  {cat.name}
                </h3>
                
                <span className="text-[11px] text-[#94734B] mt-1.5 uppercase tracking-wider font-semibold group-hover:text-[#12110F] transition-colors">
                  Ver Coleção →
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Vitrine de Produtos em Evidência com grid e botões Ébano / Ouro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-3 border-b border-[#E7DBC9]">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#B8966B] block mb-1">
              Seleção Especial
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#12110F] uppercase">
              Produtos em Destaque
            </h2>
          </div>

          <button
            onClick={() => onNavigateCategory('todos')}
            className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#12110F] hover:text-[#B8966B] transition-colors cursor-pointer"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4 text-[#B8966B]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => onAddToCart(product)}
              onViewDetails={() => onViewProduct(product)}
            />
          ))}
        </div>
      </section>

      {/* 5. Seção Newsletter no Tom Quente e Ouro */}
      <section className="bg-[#F4ECE1] py-14 border-y border-[#E7DBC9]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-[#B8966B]">
            Fique por Dentro
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#12110F] uppercase">
            Receba Novidades e Descontos Exclusivos
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4A33] max-w-lg mx-auto">
            Cadastre seu e-mail para receber cupons secretos, alertas de reposição de perfumes raros e lançamentos em primeira mão.
          </p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert('Obrigado! Seu e-mail foi cadastrado com sucesso na Dream Shopping.');
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Digite seu melhor e-mail..."
              className="w-full px-4 py-3 rounded-md bg-white border border-[#E7DBC9] text-xs text-[#12110F] outline-none focus:border-[#B8966B]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#12110F] hover:bg-[#25221E] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-md transition-all shrink-0 cursor-pointer border border-[#B8966B]/30"
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </section>

      {/* 6. Seção de Depoimentos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#B8966B] block mb-1">
            Experiência do Cliente
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#12110F] uppercase">
            O que dizem sobre nós
          </h2>
          <div className="w-16 h-0.5 bg-[#B8966B] mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-white border border-[#E7DBC9] flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex text-[#B8966B]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#12110F]/85 italic leading-relaxed">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E7DBC9] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#12110F] uppercase">{t.name}</h4>
                  <span className="text-[11px] text-[#5C4A33]">{t.location}</span>
                </div>
                <span className="text-[10px] font-semibold text-[#12110F] uppercase tracking-wider bg-[#F4ECE1] px-2 py-0.5 rounded-sm border border-[#E7DBC9]">
                  Verificada
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
