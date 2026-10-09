import React from 'react';
import { motion } from 'motion/react';

interface LuxuryIntroProps {
  onComplete: () => void;
  logoUrl: string;
}

export const LuxuryIntro: React.FC<LuxuryIntroProps> = ({ onComplete, logoUrl }) => {
  const [logoLoaded, setLogoLoaded] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  // Pré-carregamento imediato da imagem
  React.useEffect(() => {
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoLoaded(true);
  }, [logoUrl]);

  // Contagem ágil de 3 segundos com atalho tecla ESC ou Enter ou clique
  React.useEffect(() => {
    const startTime = performance.now();
    const duration = 3000;

    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed < duration) {
        animId = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    animId = requestAnimationFrame(tick);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#12110F] overflow-hidden select-none px-4 py-8 sm:py-12"
      style={{ willChange: 'opacity' }}
    >
      {/* Luz ambiente em tons Ébano e Ouro Imperial (#B8966B) */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] rounded-full bg-[#B8966B]/20 blur-3xl"
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[560px] h-[280px] sm:h-[560px] border border-[#B8966B]/20 rounded-full"
        />
      </div>

      {/* Topo: Tag de Identificação */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#E3CEAF] font-semibold">
          Alta Perfumaria • Bolsas de Grife • Skincare • Infantil
        </span>
      </motion.div>

      {/* Centro: LOGO OFICIAL LIVRE, GRANDE, TOTALMENTE RESPONSIVA */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{
            opacity: 1,
            scale: [0.96, 1.03, 1.01, 1.04],
          }}
          transition={{
            duration: 2.9,
            ease: [0.16, 1, 0.3, 1],
            times: [0, 0.35, 0.7, 1]
          }}
          className="relative w-full max-w-[92vw] sm:max-w-[540px] md:max-w-[640px] flex items-center justify-center"
        >
          {/* Imagem da Logo Oficial com halo luminoso dourado */}
          <img
            src={logoUrl}
            alt="Dream Shopping Oficial"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full max-h-[46vh] sm:max-h-[52vh] object-contain filter drop-shadow-[0_15px_45px_rgba(184,150,107,0.35)] contrast-110 brightness-110 pointer-events-none"
          />

          {/* Shimmer sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse pointer-events-none" />
        </motion.div>
      </div>

      {/* Base: Barra de Progresso de 3 Segundos em Ouro Imperial (#B8966B) */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-3">
        <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden shadow-inner">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#5C4A33] via-[#E3CEAF] to-[#B8966B] shadow-[0_0_12px_#B8966B] transition-all duration-75"
          />
        </div>

        <div className="flex items-center justify-between w-full text-[9px] uppercase tracking-[0.25em] text-[#E3CEAF] font-medium">
          <span>Salvador • Brasil</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <button
          onClick={onComplete}
          className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#FAF6EE]/90 hover:text-[#E3CEAF] transition-colors py-1.5 px-5 rounded-full border border-white/20 hover:border-[#B8966B]/60 active:scale-95 cursor-pointer"
        >
          Entrar na Loja →
        </button>
      </div>
    </motion.div>
  );
};
