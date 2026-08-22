import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { Plus, ShoppingCart, X, Check } from 'lucide-react';

// Rotações fixas (efeito "colado à mão") para não recalcular a cada render
const CARD_TILTS = [-1.6, 1.1, -0.8, 1.7, -1.2, 0.9, -1.9, 1.3];

export function Menu() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, cartTotal } = useCart();

  const [tenant, setTenant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [modalClosing, setModalClosing] = useState(false);

  const [justAdded, setJustAdded] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [flyBadges, setFlyBadges] = useState([]);
  const cartBarRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const menuRes = await api.get(`/menu/public/${slug}`);
        const tenantData = menuRes.data.tenant || menuRes.data;
        setTenant(tenantData);
        setCategories(menuRes.data.categories || tenantData.categories);
      } catch (err) {
        console.error('Erro ao carregar cardápio:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  function handleOpenModal(product) {
    setSelectedProduct(product);
    setSelectedIngredients([]);
    setNotes('');
    setQuantity(1);
    setModalClosing(false);
  }

  function handleCloseModal() {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedProduct(null);
      setSelectedIngredients([]);
      setNotes('');
      setQuantity(1);
      setModalClosing(false);
    }, 220);
  }

  function toggleIngredient(ingredient) {
    const exists = selectedIngredients.some((item) => item.id === ingredient.id);
    if (exists) {
      setSelectedIngredients(selectedIngredients.filter((item) => item.id !== ingredient.id));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  }

  function launchFlyBadge(originEl) {
    if (!originEl || !cartBarRef.current) return;
    const originRect = originEl.getBoundingClientRect();
    const targetRect = cartBarRef.current.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const dx = targetRect.left + targetRect.width / 2 - (originRect.left + originRect.width / 2);
    const dy = targetRect.top - originRect.top;

    setFlyBadges((prev) => [
      ...prev,
      { id, x: originRect.left + originRect.width / 2, y: originRect.top + originRect.height / 2, dx, dy },
    ]);

    setTimeout(() => {
      setFlyBadges((prev) => prev.filter((b) => b.id !== id));
      setCartBump(true);
      setTimeout(() => setCartBump(false), 420);
    }, 620);
  }

  function handleConfirmAddToCart() {
    if (!selectedProduct) return;
    const productToAdd = { ...selectedProduct, price: finalUnitPrice };
    addToCart(productToAdd, quantity, selectedIngredients, notes);
    launchFlyBadge(confirmBtnRef.current);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      handleCloseModal();
    }, 520);
  }

  const ingredientsTotal = selectedIngredients.reduce((acc, item) => acc + Number(item.price || 0), 0);
  const finalUnitPrice = Number(selectedProduct?.price || 0) + ingredientsTotal;
  const finalTotalPrice = finalUnitPrice * quantity;

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F1E7] pb-32 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=Work+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .sb-root, .sb-root * { font-family: 'Work Sans', sans-serif; }
        .sb-display { font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }
        .sb-marker { font-family: 'Permanent Marker', cursive; }
        .sb-mono { font-family: 'Space Mono', monospace; }

        /* grao / textura de impressao sobre tudo */
        .sb-grain { position: fixed; inset: 0; pointer-events: none; z-index: 45; opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        .sb-grip { background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 6px 6px; }

        .sb-hazard { background-image: repeating-linear-gradient(135deg, #FFC700, #FFC700 14px, #121212 14px, #121212 28px); }

        @keyframes sb-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sb-flicker { 0%, 100% { opacity: 1; } 45% { opacity: 1; } 46% { opacity: 0.3; } 47% { opacity: 1; } 78% { opacity: 1; } 79% { opacity: 0.35; } 80% { opacity: 1; } }
        @keyframes sb-pop { 0% { transform: scale(1); } 40% { transform: scale(1.18); } 100% { transform: scale(1); } }
        @keyframes sb-float { 0% { transform: translate(0,0) scale(1); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(0.35); opacity: 0; } }
        @keyframes sb-modalIn { 0% { opacity: 0; transform: translateY(24px) rotate(-1.2deg) scale(0.96); } 100% { opacity: 1; transform: translateY(0) rotate(0) scale(1); } }
        @keyframes sb-modalOut { to { opacity: 0; transform: translateY(14px) scale(0.97); } }
        @keyframes sb-kickflip { 0% { transform: rotate(0deg) translateY(0); } 50% { transform: rotate(180deg) translateY(-14px); } 100% { transform: rotate(360deg) translateY(0); } }
        @keyframes sb-spark { 0% { opacity: 0.9; transform: scale(1) translateY(0); } 100% { opacity: 0; transform: scale(0.3) translateY(10px); } }
        @keyframes sb-check { 0% { transform: scale(0) rotate(-20deg); } 60% { transform: scale(1.25) rotate(8deg); } 100% { transform: scale(1) rotate(0); } }
        @keyframes sb-cartBump { 0% { transform: scale(1); } 30% { transform: scale(1.05); } 100% { transform: scale(1); } }

        .sb-fade-up { animation: sb-fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .sb-flicker { animation: sb-flicker 3.6s ease-in-out infinite; }
        .sb-pop { animation: sb-pop 0.35s ease; }
        .sb-fly-badge { position: fixed; z-index: 70; pointer-events: none; animation: sb-float 0.62s cubic-bezier(0.3,0.6,0.4,1) forwards; }
        .sb-modal-in { animation: sb-modalIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .sb-modal-out { animation: sb-modalOut 0.2s ease forwards; }
        .sb-kickflip { display: inline-block; animation: sb-kickflip 0.9s ease-in-out infinite; }
        .sb-spark { position: absolute; width: 4px; height: 4px; border-radius: 999px; background: #FFC700; animation: sb-spark 0.9s ease-out infinite; }
        .sb-check-pop { animation: sb-check 0.32s cubic-bezier(0.34,1.56,0.64,1) both; }
        .sb-cart-bump { animation: sb-cartBump 0.42s ease; }

        /* fita adesiva */
        .sb-tape { position: absolute; width: 46px; height: 16px; background: rgba(243,241,231,0.14); border: 1px solid rgba(243,241,231,0.18); box-shadow: 0 2px 4px rgba(0,0,0,0.35); }

        /* botao estilo carimbo/serigrafia com desalinhamento */
        .sb-stencil-btn { position: relative; box-shadow: 3px 3px 0 0 #FF3B2F; transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .sb-stencil-btn:hover { transform: translate(2px, 2px); box-shadow: 1px 1px 0 0 #FF3B2F; }
        .sb-stencil-btn:active { transform: translate(3px, 3px); box-shadow: 0 0 0 0 #FF3B2F; }

        .sb-headline { color: #F3F1E7; text-shadow: 3px 3px 0 #FF3B2F; }

        .sb-ticket-edge { background-image: radial-gradient(circle at 8px 0, transparent 8px, #121212 8px); background-size: 20px 16px; background-repeat: repeat-x; background-position: top; }

        @media (prefers-reduced-motion: reduce) {
          .sb-fade-up, .sb-flicker, .sb-pop, .sb-fly-badge, .sb-modal-in, .sb-modal-out,
          .sb-kickflip, .sb-spark, .sb-check-pop, .sb-cart-bump { animation: none !important; }
        }
      `}</style>

      <div className="sb-root">
        <div className="sb-grain" />

        {/* Particulas "+1" voando ate o carrinho */}
        {flyBadges.map((b) => (
          <div key={b.id} className="sb-fly-badge" style={{ left: b.x - 14, top: b.y - 14, '--dx': `${b.dx}px`, '--dy': `${b.dy}px` }}>
            <div className="w-7 h-7 rounded-full bg-[#FFC700] text-black flex items-center justify-center text-[11px] font-black shadow-lg sb-mono">
              +1
            </div>
          </div>
        ))}

        {loading ? (
          <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#121212]">
            <div className="relative">
              <span className="sb-kickflip text-6xl inline-block">🛹</span>
              <span className="sb-spark" style={{ left: -6, bottom: -2 }} />
              <span className="sb-spark" style={{ left: 44, bottom: -2, animationDelay: '0.3s' }} />
              <span className="sb-spark" style={{ left: 20, bottom: -6, animationDelay: '0.6s' }} />
            </div>
            <p className="sb-marker text-lg text-[#FFC700] sb-flicker">descendo a rampa...</p>
          </div>
        ) : (
          <>
            {/* Faixa de perigo no topo, tipo fita zebrada de obra */}
            <div className="h-2 sb-hazard" />

            {/* Banner de Topo */}
            <div className="relative overflow-hidden border-b-4 border-[#0A0A0A]" style={{ background: 'linear-gradient(160deg, #1B1B1A 0%, #121212 70%)' }}>
              <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-[#FFC700]/10 blur-3xl" />
              <div className="absolute -bottom-16 right-0 w-72 h-72 rounded-full bg-[#FF3B2F]/10 blur-3xl" />
              <div className="absolute inset-0 sb-grip opacity-40" />

              <div className="max-w-3xl mx-auto px-6 pt-10 pb-8 relative z-10">
                <div className="flex items-center gap-5 sb-fade-up">
                  <div className="relative shrink-0">
                    {tenant?.logoUrl ? (
                      <img
                        src={tenant.logoUrl}
                        alt={tenant.name}
                        className="w-20 h-20 object-cover border-2 border-[#FFC700] rotate-[-3deg] shadow-[4px_4px_0_0_#FF3B2F]"
                      />
                    ) : (
                      <div className="w-20 h-20 border-2 border-[#FFC700] bg-[#1B1B1A] flex items-center justify-center text-3xl rotate-[-3deg] shadow-[4px_4px_0_0_#FF3B2F]">
                        🍔
                      </div>
                    )}
                    <div className="sb-tape rotate-[-8deg]" style={{ top: -8, left: -10 }} />
                  </div>
                  <div>
                    <h1 className="sb-display sb-headline text-4xl sm:text-5xl uppercase leading-none">
                      {tenant?.name || 'Skate Burger Street'}
                    </h1>
                    <p className="text-[#9C9890] text-xs font-semibold flex items-center gap-1.5 mt-2 sb-mono uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-[#3FBF5F] sb-flicker" />
                      Aberto agora · O autentico sabor das ruas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-10 space-y-14">
              {categories.map((category, catIdx) => (
                <section key={category.id} className="space-y-5 sb-fade-up" style={{ animationDelay: `${catIdx * 90}ms` }}>
                  {/* Cabecalho de categoria - placa fixada na parede */}
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 self-stretch sb-hazard rounded-sm" />
                    <div className="flex items-center gap-2.5 flex-1">
                      <span className="text-xl">{category.icon || '🛹'}</span>
                      <h2 className="sb-display text-xl sm:text-2xl uppercase text-[#F3F1E7] tracking-wide">
                        {category.name}
                      </h2>
                    </div>
                    <span className="sb-mono text-[10px] font-bold text-[#121212] bg-[#FFC700] px-2.5 py-1 rotate-2 shrink-0">
                      {category.products?.length || 0} ITENS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
                    {category.products?.map((product, prodIdx) => {
                      const tilt = CARD_TILTS[(catIdx * 3 + prodIdx) % CARD_TILTS.length];
                      return (
                        <div
                          key={product.id}
                          className="group relative bg-[#1B1B1A] border border-[#333] p-4 flex flex-col justify-between transition-all duration-300 hover:!rotate-0 hover:-translate-y-1.5 hover:border-[#FFC700]/50 hover:shadow-[6px_6px_0_0_rgba(255,199,0,0.18)] sb-fade-up"
                          style={{ transform: `rotate(${tilt}deg)`, animationDelay: `${catIdx * 90 + prodIdx * 60}ms` }}
                        >
                          <span className="sb-tape rotate-[-6deg]" style={{ top: -9, left: 14 }} />
                          <span className="sb-tape rotate-[7deg]" style={{ top: -9, right: 14 }} />

                          <div className="flex gap-3">
                            <div className="flex-1 space-y-1.5">
                              <h3 className="font-extrabold text-base text-[#F3F1E7] group-hover:text-[#FFC700] transition-colors leading-snug">
                                {product.name}
                              </h3>
                              <p className="text-[#9C9890] text-xs leading-relaxed line-clamp-2">
                                {product.description || 'Delicioso item do cardapio feito com ingredientes selecionados.'}
                              </p>
                            </div>
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-20 h-20 object-cover border border-[#333] transition-transform duration-500 group-hover:rotate-2 group-hover:scale-105"
                              />
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-[#3A3A3A]">
                            <span className="sb-mono text-[#FFC700] font-bold text-lg">
                              R$ {Number(product.price).toFixed(2).replace('.', ',')}
                            </span>
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="sb-stencil-btn bg-[#FFC700] text-black px-4 py-2 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus size={13} className="stroke-[3px]" /> Adicionar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </main>

            {/* Modal - flyer fixado na parede */}
            {selectedProduct && (
              <div
                className={`fixed inset-0 bg-black/92 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${modalClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleCloseModal}
              >
                <div
                  className={`relative bg-[#1B1B1A] border border-[#333] w-full max-w-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl ${modalClosing ? 'sb-modal-out' : 'sb-modal-in'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sb-tape rotate-[-3deg]" style={{ top: -10, left: '50%', marginLeft: -23, width: 60, height: 20 }} />

                  <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 text-[#9C9890] hover:text-white p-1.5 bg-[#121212] border border-[#333] transition-all hover:rotate-90 duration-300 cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="sb-marker text-xs text-[#FFC700] inline-block -rotate-2">street favorite</span>
                      <h2 className="sb-display text-2xl uppercase text-[#F3F1E7] mt-1 leading-none">{selectedProduct.name}</h2>
                      <p className="text-xs text-[#9C9890] mt-2 leading-relaxed">
                        {selectedProduct.description || 'Personalize seu pedido abaixo com nossos acompanhamentos especiais:'}
                      </p>
                    </div>
                    {selectedProduct.imageUrl && (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-24 h-24 object-cover border border-[#333] rotate-2"
                      />
                    )}
                  </div>

                  <div className="space-y-5">
                    {selectedProduct.customizationGroups && selectedProduct.customizationGroups.length > 0 ? (
                      selectedProduct.customizationGroups.map((relation) => {
                        const group = relation.customizationGroup;
                        if (!group) return null;
                        return (
                          <div key={group.id} className="space-y-3 bg-[#121212] p-4 border border-[#2A2A2A]">
                            <div className="flex justify-between items-center">
                              <label className="sb-display text-xs text-[#FFC700] uppercase tracking-widest">
                                {group.title}
                              </label>
                              <span className="sb-mono text-[10px] text-[#9C9890]">MAX {group.maxSelect}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {group.ingredients?.map((ing) => {
                                const isSelected = selectedIngredients.some((item) => item.id === ing.id);
                                const ingPrice = Number(ing.price || 0);
                                return (
                                  <button
                                    key={ing.id}
                                    type="button"
                                    onClick={() => toggleIngredient(ing)}
                                    className={`w-full flex items-center justify-between p-3.5 border text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                                      isSelected
                                        ? 'border-[#FFC700] bg-[#FFC700]/5 text-white font-extrabold'
                                        : 'border-[#333] bg-[#1B1B1A] text-[#9C9890] hover:text-white hover:border-[#555]'
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className={`w-4 h-4 flex items-center justify-center border transition-all ${isSelected ? 'bg-[#FFC700] border-[#FFC700] text-black' : 'border-[#555]'}`}>
                                        {isSelected && <Check size={10} className="stroke-[4px] sb-check-pop" />}
                                      </span>
                                      {ing.name}
                                    </span>
                                    {ingPrice > 0 && (
                                      <span className="sb-mono text-[#FFC700] text-xs font-bold">
                                        + R$ {ingPrice.toFixed(2).replace('.', ',')}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-[#9C9890] italic text-center py-4 bg-[#121212] border border-[#2A2A2A]">
                        Nenhum adicional disponivel para este item.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 bg-[#121212] p-4 border border-[#2A2A2A]">
                    <label className="sb-display text-xs text-[#FFC700] uppercase tracking-widest">Observacoes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Sem cebola, molho a parte, ponto da carne mal passado..."
                      rows={2}
                      className="w-full bg-[#1B1B1A] border border-[#333] p-3 text-xs text-white focus:border-[#FFC700] outline-none resize-none transition-all placeholder:text-[#666]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dashed border-[#3A3A3A]">
                    <div className="flex items-center gap-2 bg-[#121212] border border-[#333] p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 font-black text-white hover:text-[#FFC700] transition-all flex items-center justify-center text-lg active:scale-90 cursor-pointer"
                      >
                        -
                      </button>
                      <span key={quantity} className="sb-mono font-bold text-white text-sm w-6 text-center sb-pop">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 font-black text-white hover:text-[#FFC700] transition-all flex items-center justify-center text-lg active:scale-90 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      ref={confirmBtnRef}
                      onClick={handleConfirmAddToCart}
                      disabled={justAdded}
                      className={`sb-stencil-btn relative font-black px-6 py-3 text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2 ${
                        justAdded ? 'bg-[#3FBF5F] text-black' : 'bg-[#FFC700] text-black'
                      }`}
                    >
                      {justAdded ? (
                        <>
                          <Check size={14} className="stroke-[3px] sb-check-pop" /> Adicionado!
                        </>
                      ) : (
                        <>Confirmar (R$ {finalTotalPrice.toFixed(2).replace('.', ',')})</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Barra fixa do carrinho - recibo/ticket */}
            {cart.length > 0 && (
              <div
                ref={cartBarRef}
                className={`fixed bottom-0 left-0 right-0 bg-[#1B1B1A] border-t-2 border-[#FFC700] p-4 shadow-2xl z-40 ${cartBump ? 'sb-cart-bump' : ''}`}
                style={{ animation: 'sb-fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
              >
                <div className="sb-ticket-edge absolute -top-2 left-0 right-0 h-2" />
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <div>
                    <p className="sb-mono text-[10px] text-[#9C9890] uppercase tracking-wider">Total sem entrega</p>
                    <p key={cartTotal} className="sb-display text-2xl text-[#FFC700] sb-pop">
                      R$ {cartTotal.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/${slug}/checkout`)}
                    className="sb-stencil-btn bg-[#FFC700] text-black font-black px-6 py-3.5 flex items-center gap-2 uppercase tracking-wider text-xs cursor-pointer"
                  >
                    <ShoppingCart size={17} className="stroke-[2.5px]" /> Ver Carrinho ({cart.length})
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}