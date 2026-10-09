import React from 'react';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../lib/constants';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@dreamshopping.com' && password === 'admin123') {
      onLoginSuccess();
    } else {
      setError('Credenciais incorretas. Use o login administrativo padrão.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col justify-center items-center px-4 py-12">
      <button
        onClick={onBackToStore}
        className="flex items-center gap-2 text-[#5C4A33] hover:text-[#12110F] text-xs font-semibold uppercase tracking-wider mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para a Loja Dream Shopping</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7DBC9] shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src={OFFICIAL_LOGO_URL}
              alt="Dream Shopping"
              className="h-20 w-auto object-contain"
            />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-[#B8966B] font-bold">
            Acesso Restrito
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#12110F]">
            Painel Administrativo
          </h1>
          <p className="text-xs text-[#5C4A33]">
            Gestão de pedidos, PDV, produtos, frete e checkout InfinitePay.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#12110F] uppercase tracking-wider mb-1">
              E-mail Administrativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dreamshopping.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E7DBC9] text-xs focus:border-[#B8966B] outline-none text-[#12110F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#12110F] uppercase tracking-wider mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#E7DBC9] text-xs focus:border-[#B8966B] outline-none text-[#12110F]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#12110F] hover:bg-[#25221E] text-[#FAF6EE] rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#B8966B]/30"
          >
            <Lock className="w-4 h-4 text-[#B8966B]" />
            <span>Entrar no Painel</span>
          </button>
        </form>

        <div className="p-3 bg-[#F4ECE1] rounded-xl border border-[#E7DBC9] text-center space-y-1">
          <p className="text-[11px] font-semibold text-[#12110F]">
            Acesso para Demonstração:
          </p>
          <p className="text-[10px] text-[#5C4A33] font-mono">
            E-mail: <strong>admin@dreamshopping.com</strong> | Senha: <strong>admin123</strong>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#5C4A33]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sessão com Proteção SSL e Criptografia Firebase</span>
        </div>
      </div>
    </div>
  );
};
