import React from 'react';
import { 
  Instagram, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MapPin, 
  Clock, 
  Mail,
  Lock
} from 'lucide-react';
import { StoreSettings, Category } from '../types';
import { OFFICIAL_LOGO_URL } from '../lib/constants';

interface FooterProps {
  settings: StoreSettings;
  onNavigate: (view: string, filter?: string) => void;
  categories?: Category[];
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, categories }) => {
  return (
    <footer className="bg-[#12110F] text-[#FAF6EE] pt-14 pb-10 border-t border-[#5C4A33]/40">
      {/* 4 Selos de Confiança Ébano & Ouro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#5C4A33]/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#181613] border border-[#B8966B]/50 flex items-center justify-center text-[#B8966B] shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#E3CEAF]" />
            </div>
            <div>
              <h4 className="font-heading text-base text-[#FAF6EE] font-bold uppercase">100% Originais</h4>
              <p className="text-xs text-[#FAF6EE]/75 mt-1 leading-relaxed">
                Garantia de procedência internacional direta dos EUA e Europa com selos e lacres.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#181613] border border-[#B8966B]/50 flex items-center justify-center text-[#B8966B] shrink-0 shadow-sm">
              <Truck className="w-6 h-6 text-[#E3CEAF]" />
            </div>
            <div>
              <h4 className="font-heading text-base text-[#FAF6EE] font-bold uppercase">Envio Seguro</h4>
              <p className="text-xs text-[#FAF6EE]/75 mt-1 leading-relaxed">
                Correios (SEDEX / PAC) e transportadoras com seguro total e rastreamento em tempo real.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#181613] border border-[#B8966B]/50 flex items-center justify-center text-[#B8966B] shrink-0 shadow-sm">
              <CreditCard className="w-6 h-6 text-[#E3CEAF]" />
            </div>
            <div>
              <h4 className="font-heading text-base text-[#FAF6EE] font-bold uppercase">Parcele em até 12x</h4>
              <p className="text-xs text-[#FAF6EE]/75 mt-1 leading-relaxed">
                Cartão de crédito com checkout seguro e Pix com desconto especial.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#181613] border border-[#B8966B]/50 flex items-center justify-center text-[#B8966B] shrink-0 shadow-sm">
              <MessageCircle className="w-6 h-6 text-[#E3CEAF]" />
            </div>
            <div>
              <h4 className="font-heading text-base text-[#FAF6EE] font-bold uppercase">Atendimento VIP</h4>
              <p className="text-xs text-[#FAF6EE]/75 mt-1 leading-relaxed">
                Suporte personalizado e consultoria via WhatsApp de segunda a sábado.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Coluna 1: Sobre a Loja */}
        <div className="space-y-4">
          <div className="flex items-center">
            <img
              src={OFFICIAL_LOGO_URL}
              alt="Dream Shopping"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-md"
            />
          </div>
          <p className="text-xs text-[#FAF6EE]/75 leading-relaxed">
            Sua boutique online de alto luxo especializada em Perfumes importados, Bolsas de grife, Skincare coreano e Moda Infantil de alta qualidade.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#181613] border border-[#B8966B]/30 hover:bg-[#B8966B] hover:text-[#12110F] text-[#FAF6EE] flex items-center justify-center transition-all"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={settings.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#181613] border border-[#B8966B]/30 hover:bg-[#B8966B] hover:text-[#12110F] text-[#FAF6EE] flex items-center justify-center transition-all"
              title="WhatsApp Atendimento"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Coluna 2: Departamentos */}
        <div className="space-y-3">
          <h4 className="font-heading text-sm uppercase font-bold text-[#E3CEAF] tracking-wider">
            Departamentos
          </h4>
          <ul className="space-y-2 text-xs text-[#FAF6EE]/80">
            {(categories && categories.length > 0 ? categories : []).filter(c => c.active && c.id !== 'k-beauty').map(c => (
              <li key={c.id}>
                <button 
                  onClick={() => onNavigate('catalog', c.id)} 
                  className={`hover:text-[#B8966B] transition-colors cursor-pointer ${c.id.includes('promoc') ? 'text-[#B8966B] font-semibold uppercase' : ''}`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 3: Localização & Atendimento */}
        <div className="space-y-3">
          <h4 className="font-heading text-sm uppercase font-bold text-[#E3CEAF] tracking-wider">
            Atendimento & Contato
          </h4>
          <ul className="space-y-2 text-xs text-[#FAF6EE]/80">
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#B8966B]" />
              <span>Itapuã, Salvador - BA • CEP: 41635-000</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-[#B8966B]" />
              <a href={settings.whatsapp || 'https://wa.me/5571982172459'} target="_blank" rel="noopener noreferrer" className="hover:text-[#B8966B]">
                WhatsApp: (71) 98217-2459
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#B8966B]" />
              <span>Segunda a Sábado: 09h às 19h</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#B8966B]" />
              <span>Envios garantidos para todo o Brasil</span>
            </li>
          </ul>
        </div>

        {/* Coluna 4: Segurança & Pagamentos */}
        <div className="space-y-3">
          <h4 className="font-heading text-sm uppercase font-bold text-[#E3CEAF] tracking-wider">
            Formas de Pagamento
          </h4>
          <p className="text-xs text-[#FAF6EE]/75">
            Aceitamos as principais bandeiras com parcelamento em até 12x e Pix com aprovação imediata.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold text-[#12110F]">
            <span className="bg-[#FAF6EE] px-2 py-1 rounded">VISA</span>
            <span className="bg-[#FAF6EE] px-2 py-1 rounded">MASTERCARD</span>
            <span className="bg-[#FAF6EE] px-2 py-1 rounded">ELO</span>
            <span className="bg-[#B8966B] text-[#12110F] px-2 py-1 rounded font-bold">PIX</span>
            <span className="bg-[#FAF6EE] px-2 py-1 rounded">HIPERCARD</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('admin')}
              className="text-[11px] text-[#FAF6EE]/50 hover:text-[#B8966B] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#B8966B]" />
              <span>Painel Administrativo da Loja</span>
            </button>
          </div>
        </div>

      </div>

      {/* Copyright Barra Base */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#5C4A33]/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FAF6EE]/60 gap-3">
        <p>© 2026 Dream Shopping. Todos os direitos reservados. CNPJ e registro legal em Salvador/BA.</p>
        <p className="flex items-center gap-1 text-[#E3CEAF]/80">
          <span>Ambiente 100% Seguro com Certificado SSL</span>
        </p>
      </div>
    </footer>
  );
};
