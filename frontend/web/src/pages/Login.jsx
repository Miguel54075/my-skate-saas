import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Flame, Lock, Mail } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });

      const { token } = response.data;
      localStorage.setItem('@streetburger:token', token);

      navigate('/admin/kds');
    } catch (err) {
      console.error(err);
      toast.error('Falha na autenticação. Verifique e-mail e senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 relative overflow-hidden">


      <div className="sb-root w-full flex items-center justify-center">
        <div className="sb-grain" />

        {/* Elementos visuais de fundo */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFC700]/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF3B2F]/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 sb-grip opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-2 sb-hazard" />

        <div
          className="relative bg-[#1B1B1A] border border-[#333] w-full max-w-md p-8 space-y-7 shadow-2xl z-10 sb-fade-up"
          style={{ transform: 'rotate(-0.5deg)' }}
        >
          <span className="sb-tape rotate-[-6deg]" style={{ top: -9, left: 26 }} />
          <span className="sb-tape rotate-[7deg]" style={{ top: -9, right: 26 }} />

          <div className="text-center space-y-3">
            <div className="inline-flex p-3.5 bg-[#121212] border-2 border-[#FFC700] mb-1 shadow-[3px_3px_0_0_#FF3B2F] rotate-[-3deg]">
              <Flame size={30} className="text-[#FF3B2F] sb-wobble" />
            </div>
            <h1 className="sb-display sb-headline text-2xl uppercase tracking-wide">
              Painel <span className="text-[#FFC700]">Administrativo</span>
            </h1>
            <p className="text-[#9C9890] text-xs sb-mono">acesso restrito · sistema kds</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#FFC700] uppercase tracking-widest sb-mono">
                E-mail
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-[#9C9890]" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@streetburger.com"
                  className="sb-input w-full py-3 pl-11 pr-4 text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#FFC700] uppercase tracking-widest sb-mono">
                Senha
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#9C9890]" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="sb-input w-full py-3 pl-11 pr-4 text-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sb-stencil-btn w-full bg-[#FFC700] text-black font-black py-3.5 uppercase tracking-wider text-xs cursor-pointer mt-4"
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}