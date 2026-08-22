import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { Clock, CheckCircle2, Flame, Bike, AlertCircle, PlusCircle, XCircle, Utensils } from 'lucide-react';

export function KDS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('@streetburger:token');
    if (!token) {
      navigate('/login');
      return;
    }

    let activeTenantId = '';

    async function initializeKDS() {
      try {
        const userRes = await api.get('/auth/me');
        const user = userRes.data;

        if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
          alert('Acesso negado. Apenas administradores e equipe podem acessar o KDS.');
          navigate('/login');
          return;
        }

        if (!user.tenant) {
          alert('Usuário não está associado a nenhuma hamburgueria.');
          navigate('/login');
          return;
        }

        setTenantName(user.tenant.name);
        activeTenantId = user.tenant.id;

        const response = await api.get('/orders/admin');
        setOrders(response.data);

        socket.connect();
        socket.emit('joinTenantRoom', activeTenantId);

        socket.on('newOrder', (newOrder) => {
          setOrders((prev) => [newOrder, ...prev]);
        });

        socket.on('orderStatusUpdated', (updatedOrder) => {
          setOrders((prev) =>
            prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
          );
        });
      } catch (err) {
        console.error('Erro ao buscar pedidos ou perfil:', err);
        localStorage.removeItem('@streetburger:token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }

    initializeKDS();

    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdated');
      socket.disconnect();
    };
  }, [navigate]);

  async function handleUpdateStatus(orderId, newStatus) {
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Não foi possível atualizar o status do pedido.');
    }
  }

  const sharedStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=Work+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

      .sb-root, .sb-root * { font-family: 'Work Sans', sans-serif; }
      .sb-display { font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }
      .sb-marker { font-family: 'Permanent Marker', cursive; }
      .sb-mono { font-family: 'Space Mono', monospace; }

      .sb-grain { position: fixed; inset: 0; pointer-events: none; z-index: 45; opacity: 0.04; mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

      .sb-hazard { background-image: repeating-linear-gradient(135deg, #FFC700, #FFC700 14px, #121212 14px, #121212 28px); }

      @keyframes sb-fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes sb-flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      @keyframes sb-pulseBorder { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,199,0,0.25); } 50% { box-shadow: 0 0 0 6px rgba(255,199,0,0); } }
      @keyframes sb-newOrder { 0% { transform: scale(0.94) rotate(-1deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }

      .sb-fade-up { animation: sb-fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
      .sb-flicker { animation: sb-flicker 1.1s ease-in-out infinite; }
      .sb-pulse-pending { animation: sb-pulseBorder 2.2s ease-in-out infinite; }
      .sb-new-order { animation: sb-newOrder 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }

      .sb-stencil-btn { position: relative; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.5); transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .sb-stencil-btn:hover { transform: translate(2px, 2px); box-shadow: 1px 1px 0 0 rgba(0,0,0,0.5); }
      .sb-stencil-btn:active { transform: translate(3px, 3px); box-shadow: 0 0 0 0 rgba(0,0,0,0.5); }

      .sb-ticket-edge { background-image: radial-gradient(circle at 8px 0, transparent 8px, #1B1B1A 8px); background-size: 20px 16px; background-repeat: repeat-x; background-position: top; }

      @media (prefers-reduced-motion: reduce) {
        .sb-fade-up, .sb-flicker, .sb-pulse-pending, .sb-new-order { animation: none !important; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-4">
        {sharedStyles}
        <span className="text-5xl sb-flicker">🔥</span>
        <p className="sb-display text-[#FFC700] uppercase tracking-wide">Carregando painel KDS...</p>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (order) => order.status !== 'DELIVERED' && order.status !== 'CANCELED'
  );

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F1E7] p-4 sm:p-6 relative">
      {sharedStyles}
      <div className="sb-root">
        <div className="sb-grain" />

        <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-dashed border-[#333] pb-6">
          <div>
            <h1 className="sb-display text-2xl sm:text-3xl uppercase tracking-wide flex items-center gap-2 text-white">
              <Flame className="text-[#FF3B2F] sb-flicker" size={30} /> Cozinha <span className="text-[#FFC700]">/ KDS</span>
            </h1>
            <p className="text-[#9C9890] text-xs mt-1.5 sb-mono">
              hamburgueria: <span className="text-white font-bold">{tenantName || 'carregando...'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Botão de Atalho para a Gestão do Cardápio */}
            <button
              onClick={() => navigate('/admin/menu')}
              className="flex items-center gap-2 bg-[#1B1B1A] border border-[#333] hover:border-[#FFC700]/50 text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <Utensils size={14} className="text-[#FFC700]" />
              Cardápio
            </button>

            <div className="bg-[#3FBF5F]/10 border border-[#3FBF5F]/30 px-4 py-2.5 flex items-center gap-2 text-[#3FBF5F] font-black text-xs uppercase tracking-wider ml-auto sm:ml-0 sb-mono">
              <span className="w-2 h-2 bg-[#3FBF5F] rounded-full sb-flicker" /> Live
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          {activeOrders.length === 0 ? (
            <div className="text-center py-24 bg-[#1B1B1A] border border-[#333] max-w-lg mx-auto space-y-3">
              <p className="text-4xl">📭</p>
              <h2 className="sb-display text-lg text-white uppercase tracking-wider">Cozinha Vazia</h2>
              <p className="text-xs text-[#9C9890]">Nenhum pedido pendente ou em preparo no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order, idx) => {
                const statusStyles =
                  order.status === 'PENDING'
                    ? { border: 'border-[#FFC700]/50', badge: 'bg-[#FFC700]/10 text-[#FFC700] border-[#FFC700]/30', pulse: 'sb-pulse-pending' }
                    : order.status === 'PREPARING'
                    ? { border: 'border-[#FF3B2F]/50', badge: 'bg-[#FF3B2F]/10 text-[#FF3B2F] border-[#FF3B2F]/30', pulse: '' }
                    : { border: 'border-[#3FBF5F]/50', badge: 'bg-[#3FBF5F]/10 text-[#3FBF5F] border-[#3FBF5F]/30', pulse: '' };

                return (
                  <div
                    key={order.id}
                    className={`relative bg-[#1B1B1A] border p-5 space-y-4 flex flex-col justify-between transition-all duration-300 sb-fade-up ${statusStyles.border} ${statusStyles.pulse}`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="sb-ticket-edge absolute -top-2 left-0 right-0 h-2" />
                    <div>
                      <div className="flex justify-between items-start border-b border-dashed border-[#333] pb-3">
                        <div>
                          <h3 className="font-extrabold text-base text-white tracking-wide">
                            {order.customerName || 'Cliente'}
                          </h3>
                          <p className="text-[11px] text-[#9C9890] sb-mono">{order.customerPhone || 'Sem telefone'}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border sb-mono ${statusStyles.badge}`}>
                          {order.status === 'PENDING' ? 'Pendente' : order.status === 'PREPARING' ? 'Preparando' : 'Pronto'}
                        </span>
                      </div>

                      <p className="text-xs text-[#9C9890] mt-2.5 flex items-center gap-1">
                        <span className="text-[#FFC700]">📍</span> {order.deliveryAddress || 'Retirada no Balcão'}
                      </p>

                      {/* Itens do Pedido */}
                      <div className="mt-4 space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="bg-[#121212] p-3 border border-[#2A2A2A] space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-white">
                                <span className="sb-mono text-[#FFC700]">{item.quantity}x</span>{' '}
                                {item.product?.name || item.name || 'Hambúrguer'}
                              </span>
                            </div>

                            {/* Observações / Retiradas */}
                            {item.notes && (
                              <div className="space-y-1">
                                {item.notes.split('|').map((note, nidx) => (
                                  <p key={nidx} className="text-xs text-[#FFC700] font-semibold flex items-center gap-1">
                                    <AlertCircle size={12} className="text-[#FFC700]" /> {note.trim()}
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* Adicionais com Nome e Preço Reais */}
                            {item.selectedIngredients && item.selectedIngredients.length > 0 && (
                              <div className="pt-1.5 border-t border-dashed border-[#2A2A2A] space-y-1">
                                <p className="text-[10px] text-[#FF3B2F] font-black uppercase tracking-wider sb-mono">Adicionais</p>
                                {item.selectedIngredients.map((sel) => (
                                  <p key={sel.id} className="text-xs text-[#FFC700]/90 flex items-center gap-1.5 pl-1 font-medium">
                                    • {sel.ingredient?.name || 'Ingrediente'} (+ R$ {Number(sel.unitPrice || 0).toFixed(2)})
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* Total do Item Calculado */}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-[#2A2A2A] text-xs font-bold">
                              <span className="text-[#9C9890]">Subtotal:</span>
                              <span className="sb-mono text-[#FFC700]">
                                R$ {Number(item.subtotal || 0).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-4 border-t border-dashed border-[#333] flex flex-col gap-2">
                      <div className="flex gap-2">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                            className="sb-stencil-btn w-full bg-[#FF3B2F] text-white font-black py-3 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
                          >
                            <Flame size={14} /> Preparar
                          </button>
                        )}

                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'READY')}
                            className="sb-stencil-btn w-full bg-[#3FBF5F] text-black font-black py-3 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
                          >
                            <CheckCircle2 size={14} /> Pronto
                          </button>
                        )}

                        {order.status === 'READY' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                            className="sb-stencil-btn w-full bg-[#FFC700] text-black font-black py-3 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
                          >
                            <Bike size={14} /> Entregar
                          </button>
                        )}
                      </div>

                      {/* Botão de Cancelar Pedido */}
                      <button
                        onClick={() => {
                          if (confirm('Deseja realmente cancelar este pedido?')) {
                            handleUpdateStatus(order.id, 'CANCELED');
                          }
                        }}
                        className="w-full bg-[#FF3B2F]/5 border border-[#FF3B2F]/20 hover:bg-[#FF3B2F]/10 hover:border-[#FF3B2F]/40 text-[#FF3B2F] font-extrabold py-2.5 flex items-center justify-center gap-1.5 transition-all text-[11px] uppercase tracking-wider cursor-pointer"
                      >
                        <XCircle size={12} /> Cancelar Pedido
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}