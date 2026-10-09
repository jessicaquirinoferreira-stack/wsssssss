import { Product, StoreSettings, Category, MenuItem } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "Dream Shopping | Perfumes, Bolsas & Skincare Importados",
  instagram: "https://www.instagram.com/dsdreamshopping_ba/",
  whatsapp: "https://wa.me/5571982172459",
  cepOrigin: "41635000",
  heroImageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85",
  infinitePayHandle: "dsdreamshopping_ba",
  infinitePayWebhookSecret: "",
  jadlogToken: "",
  jadlogCnpj: "",
  blobToken: ""
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "perfumes",
    name: "Perfumes",
    description: "Fragrâncias internacionais 100% originais de alta fixação e nicho exclusivo",
    order: 1,
    active: true
  },
  {
    id: "cabelo",
    name: "Cabelo",
    description: "Tratamentos capilares profissionais, óleos nutritivos e finalizadores de alto padrão",
    order: 2,
    active: true
  },
  {
    id: "bolsas",
    name: "Bolsas",
    description: "Bolsas originais Michael Kors, Juicy Couture e acessórios importados",
    order: 3,
    active: true
  },
  {
    id: "baby-kids",
    name: "Baby & Kids",
    description: "Moda infantil e conjuntos importados confortáveis e de alta qualidade",
    order: 4,
    active: true
  },
  {
    id: "skincare",
    name: "Skin Care",
    description: "Tratamentos faciais dermatológicos e cuidados avançados para a pele",
    order: 5,
    active: true
  },
  {
    id: "promocoes",
    name: "PROMOÇÕES",
    description: "Ofertas imperdíveis com descontos especiais e pronta entrega",
    order: 6,
    active: true
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: "menu-todos",
    label: "Todos os Produtos",
    type: "all",
    target: "todos",
    order: 1,
    active: true
  },
  {
    id: "menu-perfumes",
    label: "Perfumes",
    type: "category",
    target: "perfumes",
    order: 2,
    active: true
  },
  {
    id: "menu-cabelo",
    label: "Cabelo",
    type: "category",
    target: "cabelo",
    order: 3,
    active: true
  },
  {
    id: "menu-bolsas",
    label: "Bolsas",
    type: "category",
    target: "bolsas",
    order: 4,
    active: true
  },
  {
    id: "menu-baby-kids",
    label: "Baby & Kids",
    type: "category",
    target: "baby-kids",
    order: 5,
    active: true
  },
  {
    id: "menu-skincare",
    label: "Skin Care",
    type: "category",
    target: "skincare",
    order: 6,
    active: true
  },
  {
    id: "menu-promocoes",
    label: "PROMOÇÕES",
    type: "category",
    target: "promocoes",
    order: 7,
    active: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-mk-jet-set",
    name: "Bolsa Tote Jet Set Travel Large Saffiano",
    brand: "Michael Kors",
    category: "bolsas",
    price: 1890.00,
    originalPrice: 2290.00,
    stock: 4,
    weightGrams: 850,
    featured: true,
    active: true,
    description: "Autêntica bolsa tote Michael Kors Jet Set confeccionada em couro Saffiano texturizado de altíssima durabilidade. Ferragens douradas exclusivas, múltiplos bolsos internos e fechamento em zíper reforçado. Acompanha certificado, dustbag original e etiqueta de autenticidade.",
    specifications: "Material: 100% Couro Saffiano legítimo | Dimensões: 38cm x 28cm x 11cm | Origem: Importada USA",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-jc-daydreamer",
    name: "Bolsa Velour Daydreamer Vintage Charm",
    brand: "Juicy Couture",
    category: "bolsas",
    price: 1580.00,
    originalPrice: 1850.00,
    stock: 3,
    weightGrams: 700,
    featured: true,
    active: true,
    description: "Ícone Y2K Juicy Couture em veludo premium bordado com o clássico monograma da marca. Acompanha chaveiro decorativo em metal e fita de cetim acetinada. Peça vintage de colecionador, 100% original importada.",
    specifications: "Acabamento: Veludo bordado com detalhes em couro sintético premium | Cor: Rosa Quartz / Dourado | Origem: USA",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-baccarat-rouge",
    name: "Maison Francis Kurkdjian Baccarat Rouge 540 EDP 70ml",
    brand: "Maison Francis Kurkdjian",
    category: "perfumes",
    price: 2650.00,
    originalPrice: 2980.00,
    stock: 5,
    weightGrams: 450,
    featured: true,
    active: true,
    description: "Uma alquimia luminosa e intensa. Assinatura olfativa amadeirada-ambarada com notas aéreas de jasmim, açafrão precioso, cedro recém-cortado e o aconchegante acorde mineral de âmbar cinzento. Importação autêntica de Paris.",
    specifications: "Concentração: Eau de Parfum | Volume: 70ml | Pirâmide Olfativa: Jasmim, Açafrão, Cedro, Ambergris | Fixação: Acima de 14h",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-creed-aventus",
    name: "Creed Aventus Millésime Eau de Parfum 100ml",
    brand: "House of Creed",
    category: "perfumes",
    price: 2890.00,
    originalPrice: 3200.00,
    stock: 4,
    weightGrams: 500,
    featured: true,
    active: true,
    description: "A fragrância mais cobiçada da perfumaria mundial. Inspirada na vida dramática de um imperador histórico que celebrou força, poder e sucesso. Notas de topo com abacaxi defumado, groselha preta, bergamota italiana e maçã.",
    specifications: "Concentração: Millésime EDP | Volume: 100ml | Família: Chipre Frutado | Origem: França",
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-tom-ford-lost-cherry",
    name: "Tom Ford Private Blend Lost Cherry EDP 50ml",
    brand: "Tom Ford",
    category: "perfumes",
    price: 2490.00,
    originalPrice: 2750.00,
    stock: 3,
    weightGrams: 420,
    featured: true,
    active: true,
    description: "Uma jornada encorpada até o outrora proibido. O cereja preta madura banhada em licor de cereja com uma provocante pitada de amêndoa amarga. Luxo absoluto com assinatura icônica de Tom Ford.",
    specifications: "Linha: Private Blend | Volume: 50ml | Notas: Licor de Cereja Negra, Amêndoa Amarga, Rosa Turca, Fava Tonka",
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-kerastase-elixir-ultime",
    name: "Kérastase Elixir Ultime Óleo Capilar Original 100ml",
    brand: "Kérastase Paris",
    category: "cabelo",
    price: 360.00,
    originalPrice: 420.00,
    stock: 10,
    weightGrams: 260,
    featured: true,
    active: true,
    description: "O óleo capilar de luxo mais premiado do mundo. Enriquecido com óleo de camélia francesa e óleo de marula precioso, proporciona nutrição profunda, brilho espelhado e controle de frizz por até 96h sem pesar os fios.",
    specifications: "Volume: 100ml | Uso: Pré-escova, finalizador ou tratamento | Origem: França",
    images: [
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-olaplex-no3",
    name: "Olaplex Nº 3 Hair Perfector Tratamento Reconstrutor 100ml",
    brand: "Olaplex",
    category: "cabelo",
    price: 245.00,
    originalPrice: 289.00,
    stock: 8,
    weightGrams: 220,
    featured: false,
    active: true,
    description: "Tratamento reconstrutor global patenteado com tecnologia Bond Building. Restaura ligações dissulfeto quebradas por químicas, descolorações e calor, devolvendo a força e elasticidade natural dos fios.",
    specifications: "Volume: 100ml | Livre de sulfatos e parabenos | Origem: EUA",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-medicube-zero-pore-pads",
    name: "Medicube Zero Pore Pads 2.0 (70 pads)",
    brand: "Medicube",
    category: "skincare",
    price: 185.00,
    originalPrice: 220.00,
    stock: 15,
    weightGrams: 280,
    featured: true,
    active: true,
    description: "Sucesso viral e campeão de vendas na Coreia. Discos tonificantes com patente anti-poros com AHA e BHA naturais que removem células mortas, controlam a oleosidade e diminuem visivelmente o tamanho dos poros.",
    specifications: "Contém: 70 pads dupla-face (texturizada e suave) | Origem: Seul, Coreia do Sul",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-beauty-of-joseon-relief-sun",
    name: "Protetor Solar Relief Sun Rice + Probiotics SPF50+ PA++++",
    brand: "Beauty of Joseon",
    category: "skincare",
    price: 169.00,
    originalPrice: 199.00,
    stock: 20,
    weightGrams: 100,
    featured: true,
    active: true,
    description: "Fórmula solar coreana leve como hidratante com 30% de extrato de arroz fermentado e probióticos de grãos. Não deixa rastro branco, não arde os olhos e confere viço orvalhado (glow natural de pele saudável).",
    specifications: "Volume: 50ml | Filtro: Químico de última geração FPS 50+ | Origem: Coreia do Sul",
    images: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-conjunto-infantil-algodao",
    name: "Conjunto Infantil Premium 100% Algodão Pima",
    brand: "Dream Kids Importados",
    category: "baby-kids",
    price: 189.00,
    originalPrice: 229.00,
    stock: 12,
    weightGrams: 220,
    featured: true,
    active: true,
    description: "Conjunto infantil macio confeccionado em algodão Pima respirável de toque aveludado. Modelagem confortável para o dia a dia e passeios com acabamento de alfaiataria infantil reforçado.",
    specifications: "Material: 100% Algodão Pima Orgânico | Tamanhos: 2 a 8 anos | Hipoalergênico",
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-vestido-floral-kids",
    name: "Vestido Romântico Infantil Floral Bordado",
    brand: "Dream Kids Importados",
    category: "baby-kids",
    price: 165.00,
    originalPrice: 195.00,
    stock: 8,
    weightGrams: 180,
    featured: false,
    active: true,
    description: "Vestidinho delicado em tecido nobre acetinado com estampa floral suave e bordados artesanais. Conforto total para festas e ocasiões especiais.",
    specifications: "Tecido: 100% Algodão com forro suave | Fechamento: Zíper invisível",
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-promo-kit-luxo",
    name: "Kit Especial Promoção: Miniatura Baccarat + Óleo Kérastase",
    brand: "Dream Shopping Exclusives",
    category: "promocoes",
    price: 499.00,
    originalPrice: 750.00,
    stock: 6,
    weightGrams: 350,
    featured: true,
    active: true,
    description: "Oferta promocional por tempo limitado unindo o prestigiado Baccarat Rouge 540 e o elixir de tratamento capilar Kérastase Paris.",
    specifications: "Contém: 1x Decant Premium Baccarat Rouge 10ml + 1x Kérastase Elixir 50ml",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85"
    ],
    createdAt: new Date().toISOString()
  }
];
