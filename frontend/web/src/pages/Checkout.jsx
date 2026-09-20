import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { ArrowLeft, Trash2, Send, PlusCircle, ShoppingBag } from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'PIX', label: 'Pix' },
  { value: 'CARD', label: 'Cartão' },
  { value: 'CASH', label: 'Dinheiro' },
];

export function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const toast = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [loading, setLoading] = useState(false);

  async function handleCreateOrder(e) {
    e.preventDefault();

    if (!customerName || !customerPhone || !deliveryAddress) {
      toast.warning('Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (cart.length === 0) {
      toast.warning('Seu carrinho está vazio.');
      return;
    }

    try {
      setLoading(true);

      const menuRes = await api.get(`/menu/public/${slug}`);
      const tenantData = menuRes.data.tenant || menuRes.data;
      const tenantId = tenantData.id || tenantData.tenantId;

      if (!tenantId) {
        toast.error('Não foi possível identificar a hamburgueria. Verifique o link acessado.');
        return;
      }

      const orderPayload = {
        tenantId,
        customerName,
        customerPhone,
        deliveryAddress,
        paymentMethod,
        items: cart.map((item) => {
          const rawIngredients = item.selectedIngredients || item.ingredients || item.extras || [];

          return {
            productId: item.productId || item.id,
            quantity: item.quantity,
            notes: item.notes || '',
            selectedIngredients: rawIngredients.map((ing) => {
              // Se for objeto, tenta pegar o id de várias formas possíveis
              if (typeof ing === 'object' && ing !== null) {
                return ing.id || ing.ingredientId || ing._id || ing.name;
              }
              return ing; // Se já for o ID ou string direto
            }),
          };
        }),
      };

      await api.post('/orders/public', orderPayload);

      clearCart();
      toast.success('Pedido enviado com sucesso para a cozinha! 🍔');
      navigate(`/${slug}`);
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      toast.error('Ocorreu um erro ao enviar o pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F1E7] pb-16 relative">


      <div className="sb-root">
        <div className="sb-grain" />
        <div className="h-2 sb-hazard" />

        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
          <button
            onClick={() => navigate(`/${slug}`)}
            className="flex items-center gap-2 text-[#9C9890] hover:text-[#FFC700] transition-colors text-sm font-semibold sb-fade-up"
          >
            <ArrowLeft size={18} /> Voltar ao Cardápio
          </button>

          <div className="sb-fade-up" style={{ animationDelay: '60ms' }}>
            <span className="sb-marker text-sm text-[#FFC700] inline-block -rotate-2">último passo</span>
            <h1 className="sb-display sb-headline text-3xl sm:text-4xl uppercase leading-none mt-1">
              Finalizar Pedido
            </h1>
          </div>

          {/* Resumo dos Itens — ticket colado na parede */}
          <div
            className="relative bg-[#1B1B1A] border border-[#333] p-4 space-y-4 sb-fade-up"
            style={{ animationDelay: '110ms', transform: 'rotate(-0.5deg)' }}
          >
            <span className="sb-tape rotate-[-6deg]" style={{ top: -9, left: 20 }} />
            <span className="sb-tape rotate-[7deg]" style={{ top: -9, right: 20 }} />

            <h2 className="sb-display text-lg text-white uppercase tracking-wide border-b border-dashed border-[#3A3A3A] pb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#FFC700]" /> Itens no Carrinho
            </h2>

            {cart.length === 0 ? (
              <p className="text-[#9C9890] text-sm py-4 text-center italic">Seu carrinho está vazio.</p>
            ) : (
              cart.map((item) => {
                // Suporta múltiplos nomes para a lista de adicionais
                const ingredients = item.selectedIngredients || item.ingredients || item.extras || [];

                // Calcula preço unitário base + adicionais (se os adicionais possuírem propriedade de preço)
                const extrasTotal = ingredients.reduce((acc, ing) => {
                  return acc + (typeof ing === 'object' ? Number(ing.price || ing.additionalPrice || 0) : 0);
                }, 0);

                const itemUnitPrice = Number(item.price || 0) + extrasTotal;
                const itemTotalPrice = itemUnitPrice * item.quantity;

                return (
                  <div
                    key={item.cartItemId || item.id}
                    className="flex items-start justify-between border-b border-dashed border-[#333] pb-3"
                  >
                    <div className="space-y-1">
                      <p className="font-extrabold text-white">
                        <span className="sb-mono text-[#FFC700]">{item.quantity}x</span> {item.name || item.title}
                      </p>

                      {/* Renderização dos Adicionais */}
                      {ingredients.length > 0 && (
                        <div className="pl-2.5 border-l-2 border-[#FFC700]/60 text-xs text-[#9C9890] space-y-0.5 my-1.5">
                          <p className="font-bold text-[#FFC700] flex items-center gap-1 uppercase tracking-wide text-[10px]">
                            <PlusCircle size={11} /> Adicionais
                          </p>
                          {ingredients.map((ing, idx) => {
                            const ingName = typeof ing === 'object' ? ing.name || ing.title || ing.label : ing;
                            const ingPrice = typeof ing === 'object' && ing.price ? Number(ing.price) : 0;

                            return (
                              <p key={idx} className="text-[#B5B2A8]">
                                + {ingName} {ingPrice > 0 ? <span className="sb-mono">(R$ {ingPrice.toFixed(2).replace('.', ',')})</span> : ''}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      {/* Observações */}
                      {item.notes && (
                        <p className="text-xs text-amber-400 italic">Obs: {item.notes}</p>
                      )}

                      <p className="sb-mono text-[#FFC700] text-sm font-bold pt-1">
                        R$ {itemTotalPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId || item.id)}
                      className="text-[#FF3B2F] hover:text-red-400 p-2 transition-all hover:scale-110 active:scale-90 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="sb-display text-lg uppercase tracking-wide">Total</span>
              <span key={cartTotal} className="sb-display text-2xl text-[#FFC700] sb-pop">
                R$ {cartTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Formulário de Dados do Cliente */}
          <form
            onSubmit={handleCreateOrder}
            className="relative bg-[#1B1B1A] border border-[#333] p-4 space-y-5 sb-fade-up"
            style={{ animationDelay: '160ms', transform: 'rotate(0.4deg)' }}
          >
            <span className="sb-tape rotate-[-4deg]" style={{ top: -9, left: '50%', marginLeft: -23 }} />

            <h2 className="sb-display text-lg text-white uppercase tracking-wide border-b border-dashed border-[#3A3A3A] pb-3">
              Dados para Entrega
            </h2>

            <div>
              <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1.5 sb-mono">
                Seu Nome
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Lucas Silva"
                className="sb-input w-full p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1.5 sb-mono">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ex: 18999998888"
                className="sb-input w-full p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1.5 sb-mono">
                Endereço Completo
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Rua, Número, Bairro"
                className="sb-input w-full p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-2 sb-mono">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const isActive = paymentMethod === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-3 text-xs font-extrabold uppercase tracking-wide border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FFC700] text-black border-[#FFC700]'
                          : 'bg-[#121212] text-[#9C9890] border-[#333] hover:text-white hover:border-[#555]'
                      }`}
                    >
                      {method.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="sb-stencil-btn w-full bg-[#FFC700] text-black font-black py-3.5 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Send size={18} className={loading ? 'animate-pulse' : ''} />
              {loading ? 'Enviando pra cozinha...' : 'Enviar Pedido'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}