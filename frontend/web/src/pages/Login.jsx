import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Flame, Lock, Mail } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      alert('Falha na autenticação. Verifique e-mail e senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=Work+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .sb-root, .sb-root * { font-family: 'Work Sans', sans-serif; }
        .sb-display { font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }
        .sb-marker { font-family: 'Permanent Marker', cursive; }
        .sb-mono { font-family: 'Space Mono', monospace; }

        .sb-grain { position: fixed; inset: 0; pointer-events: none; z-index: 45; opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        .sb-grip { background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 6px 6px; }

        .sb-hazard { background-image: repeating-linear-gradient(135deg, #FFC700, #FFC700 14px, #121212 14px, #121212 28px); }

        @keyframes sb-fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sb-flicker { 0%, 100% { opacity: 1; } 45% { opacity: 1; } 46% { opacity: 0.3; } 47% { opacity: 1; } 78% { opacity: 1; } 79% { opacity: 0.35; } 80% { opacity: 1; } }
        @keyframes sb-wobble { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(4deg); } }

        .sb-fade-up { animation: sb-fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .sb-flicker { animation: sb-flicker 3.6s ease-in-out infinite; }
        .sb-wobble { animation: sb-wobble 2.4s ease-in-out infinite; }

        .sb-tape { position: absolute; width: 46px; height: 16px; background: rgba(243,241,231,0.14); border: 1px solid rgba(243,241,231,0.18); box-shadow: 0 2px 4px rgba(0,0,0,0.35); }

        .sb-stencil-btn { position: relative; box-shadow: 3px 3px 0 0 #FF3B2F; transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .sb-stencil-btn:hover { transform: translate(2px, 2px); box-shadow: 1px 1px 0 0 #FF3B2F; }
        .sb-stencil-btn:active { transform: translate(3px, 3px); box-shadow: 0 0 0 0 #FF3B2F; }
        .sb-stencil-btn:disabled { opacity: 0.5; pointer-events: none; }

        .sb-headline { color: #F3F1E7; text-shadow: 2px 2px 0 #FF3B2F; }

        .sb-input { background: #121212; border: 1px solid #333; color: #F3F1E7; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .sb-input:focus { border-color: #FFC700; box-shadow: 0 0 0 3px rgba(255,199,0,0.12); outline: none; }
        .sb-input::placeholder { color: #666; }

        @media (prefers-reduced-motion: reduce) {
          .sb-fade-up, .sb-flicker, .sb-wobble { animation: none !important; }
        }
      `}</style>

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