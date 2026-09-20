import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { Plus, ShoppingCart, X, Check, ArrowLeft, Eye, AlertTriangle } from 'lucide-react';
import skateLogo from '../assets/images/Skate_Logo.jpg';
import bannerImg from '../assets/images/Banner.png';
import bgCardapio from '../assets/images/BackGround_Cardapio.jpg';

// Rotações fixas para os cards (efeito "colado à mão")
const CARD_TILTS = [-1.6, 1.1, -0.8, 1.7, -1.2, 0.9, -1.9, 1.3];

export function Menu() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cart = [], addToCart, cartTotal = 0 } = useCart();

  const [tenant, setTenant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

  // Busca dos dados do cardápio público
  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      try {
        setLoading(true);
        setNotFound(false);

        const menuRes = await api.get(`/menu/public/${slug}`);
        const tenantData = menuRes.data?.tenant || menuRes.data || {};

        setTenant(tenantData);

        // Garante que categories sempre seja um Array válido
        const rawCategories = menuRes.data?.categories || tenantData?.categories || [];
        setCategories(Array.isArray(rawCategories) ? rawCategories : []);
      } catch (err) {
        console.error('Erro ao carregar cardápio:', err);
        if (err.response?.status === 404) {
          setNotFound(true);
        }
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  // Lock do scroll da página e atalho da tecla ESC ao abrir o modal
  useEffect(() => {
    if (!selectedProduct) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProduct]);

  // Quantidade total de itens no carrinho (somando as unidades de cada item)
  const totalCartQuantity = cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0);

  // Cálculos de preço unitário e total para o modal do produto
  const ingredientsTotal = selectedIngredients.reduce(
    (acc, item) => acc + Number(item.price || 0),
    0
  );
  const finalUnitPrice = Number(selectedProduct?.price || 0) + ingredientsTotal;
  const finalTotalPrice = finalUnitPrice * quantity;

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

  function toggleIngredient(ingredient, group) {
    const maxSelect = group?.maxSelect || 1;
    const groupIngredientIds = group?.ingredients?.map((i) => i.id) || [];
    const isSelected = selectedIngredients.some((item) => item.id === ingredient.id);

    if (isSelected) {
      // Desmarcar item
      setSelectedIngredients((prev) => prev.filter((item) => item.id !== ingredient.id));
    } else {
      // Marcar item respeitando as regras do grupo
      if (maxSelect === 1) {
        // Seleção única (comportamento Radio)
        const filtered = selectedIngredients.filter((item) => !groupIngredientIds.includes(item.id));
        setSelectedIngredients([...filtered, ingredient]);
      } else {
        // Multi-seleção com limite máximo
        const currentGroupCount = selectedIngredients.filter((item) =>
          groupIngredientIds.includes(item.id)
        ).length;

        if (currentGroupCount < maxSelect) {
          setSelectedIngredients((prev) => [...prev, ingredient]);
        }
      }
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

  // Renderização do Estado de Carregamento (Loading)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#121212] text-[#F3F1E7]">
        <div className="relative">
          <span className="sb-kickflip text-6xl inline-block">🛹</span>
          <span className="sb-spark" style={{ left: -6, bottom: -2 }} />
          <span className="sb-spark" style={{ left: 44, bottom: -2, animationDelay: '0.3s' }} />
          <span className="sb-spark" style={{ left: 20, bottom: -6, animationDelay: '0.6s' }} />
        </div>
        <p className="sb-marker text-lg text-[#FFC700] sb-flicker">descendo a rampa...</p>
      </div>
    );
  }

  // Renderização de Erro 404 (Slug não cadastrado/encontrado)
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F3F1E7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFC700]/10 border border-[#FFC700]/30 flex items-center justify-center text-[#FFC700] mb-4">
          <AlertTriangle size={32} />
        </div>
        <h1 className="sb-display text-3xl sm:text-4xl text-[#FFC700] uppercase tracking-wide">
          Cardápio Não Encontrado
        </h1>
        <p className="text-[#9C9890] text-sm mt-3 max-w-md leading-relaxed">
          Não encontramos nenhum estabelecimento cadastrado com o endereço{' '}
          <span className="text-white font-mono font-bold bg-[#1B1B1A] px-2 py-0.5 border border-[#333]">
            "{slug}"
          </span>
          .
        </p>
        <button
          onClick={() => navigate('/')}
          className="sb-stencil-btn mt-8 bg-[#FFC700] text-black px-6 py-3 font-black text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F1E7] relative flex flex-col">
      <div className="sb-root flex flex-col flex-1">
        <div className="sb-grain" />

        {/* Partículas "+1" voando até a barra do carrinho */}
        {flyBadges.map((b) => (
          <div
            key={b.id}
            className="sb-fly-badge"
            style={{ left: b.x - 14, top: b.y - 14, '--dx': `${b.dx}px`, '--dy': `${b.dy}px` }}
          >
            <div className="w-7 h-7 rounded-full bg-[#FFC700] text-black flex items-center justify-center text-[11px] font-black shadow-lg sb-mono">
              +1
            </div>
          </div>
        ))}

        {/* Faixa decorativa no topo */}
        <div className="h-2 sb-hazard" />

        {/* Banner com a Logo do Estabelecimento */}
        <div className="relative overflow-hidden border-b-4 border-[#0A0A0A]">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${tenant?.bannerUrl || bannerImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-60 h-60 rounded-full bg-[#FFC700]/8 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 sb-grip opacity-15 pointer-events-none" />

          <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-8 pb-7 relative z-10">
            <div className="flex items-center gap-5 sm:gap-6 sb-fade-up">
              <div className="relative shrink-0">
                <img
                  src={tenant?.logoUrl || skateLogo}
                  alt={tenant?.name || 'Skate Burger Street'}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border-2 border-[#FFC700] rotate-[-2.5deg] shadow-[4px_4px_0_0_#FF3B2F] bg-[#121212]"
                />
                <div className="sb-tape rotate-[-8deg]" style={{ top: -8, left: -10 }} />
                <div className="sb-tape rotate-[10deg]" style={{ bottom: -6, right: -8 }} />
              </div>

              <div className="space-y-1">
                <h1 className="sb-display sb-headline text-3xl sm:text-5xl uppercase leading-none tracking-tight">
                  {tenant?.name || 'Skate Burger Street'}
                </h1>
                <p className="text-[#9C9890] text-xs font-semibold flex items-center gap-2 pt-1 sb-mono uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3FBF5F] sb-flicker shrink-0" />
                  <span>Aberto agora · O autêntico sabor das ruas</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Categorias e Produtos */}
        <main
          className="relative px-4 sm:px-6 pb-36 flex-1"
          style={{
            backgroundImage: `url(${bgCardapio})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'repeat-y',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(18,18,18,0.70) 0%, rgba(18,18,18,0.58) 15%, rgba(18,18,18,0.55) 50%, rgba(18,18,18,0.60) 85%, rgba(18,18,18,0.75) 100%)',
            }}
          />
          <div className="max-w-3xl mx-auto mt-10 space-y-14 relative z-10">
            {(categories || []).map((category, catIdx) => (
              <section
                key={category.id || catIdx}
                className="space-y-5 sb-fade-up"
                style={{ animationDelay: `${catIdx * 90}ms` }}
              >
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
                        key={product.id || prodIdx}
                        onClick={() => handleOpenModal(product)}
                        className="group relative bg-[#1B1B1A] border border-[#333] p-4 flex flex-col justify-between transition-all duration-300 hover:!rotate-0 hover:-translate-y-1.5 hover:border-[#FFC700]/70 hover:shadow-[6px_6px_0_0_rgba(255,199,0,0.22)] sb-fade-up cursor-pointer select-none"
                        style={{
                          transform: `rotate(${tilt}deg)`,
                          animationDelay: `${catIdx * 90 + prodIdx * 60}ms`,
                        }}
                      >
                        <span className="sb-tape rotate-[-6deg]" style={{ top: -9, left: 14 }} />
                        <span className="sb-tape rotate-[7deg]" style={{ top: -9, right: 14 }} />

                        <div className="flex gap-3">
                          <div className="flex-1 space-y-1.5">
                            <h3 className="font-extrabold text-base text-[#F3F1E7] group-hover:text-[#FFC700] transition-colors leading-snug flex items-center gap-1.5">
                              <span>{product.name}</span>
                            </h3>
                            <p className="text-[#9C9890] text-xs leading-relaxed line-clamp-2">
                              {product.description ||
                                'Delicioso item do cardápio feito com ingredientes selecionados.'}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#FFC700]/80 font-medium group-hover:text-[#FFC700] pt-0.5">
                              <Eye size={12} /> Toque para ver detalhes{' '}
                              {product.modelUrl && (
                                <span className="bg-[#FFC700] text-black px-1 ml-1 rounded-sm text-[9px] font-bold">
                                  3D
                                </span>
                              )}
                            </span>
                          </div>
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-20 h-20 object-cover border border-[#333] transition-transform duration-500 group-hover:rotate-2 group-hover:scale-105 shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-[#121212] border border-[#333] flex items-center justify-center text-2xl group-hover:rotate-2 group-hover:border-[#FFC700]/50 transition-all shrink-0">
                              🍔
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-[#3A3A3A]">
                          <span className="sb-mono text-[#FFC700] font-bold text-lg">
                            R$ {Number(product.price || 0).toFixed(2).replace('.', ',')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(product);
                            }}
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
          </div>
        </main>

        {/* Modal de Detalhes e Customização do Produto */}
        {selectedProduct && (
          <div
            className={`fixed inset-0 bg-black/92 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 transition-opacity duration-200 ${
              modalClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleCloseModal}
          >
            <div
              className={`relative bg-[#1B1B1A] border border-[#333] w-full max-w-lg p-5 sm:p-6 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl ${
                modalClosing ? 'sb-modal-out' : 'sb-modal-in'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="sb-tape rotate-[-3deg]"
                style={{ top: -10, left: '50%', marginLeft: -23, width: 60, height: 20 }}
              />

              {/* Header do Modal */}
              <div className="flex items-center justify-between border-b border-dashed border-[#333] pb-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex items-center gap-1.5 text-xs text-[#9C9890] hover:text-[#FFC700] font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} /> Voltar ao cardápio
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-[#9C9890] hover:text-white p-1.5 bg-[#121212] border border-[#333] transition-all hover:rotate-90 duration-300 cursor-pointer"
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mídia: Foto 2D / Visualização 3D */}
              <div className="space-y-4">
                {selectedProduct.modelUrl ? (
                  <div className="relative overflow-hidden border-2 border-[#333] bg-[#121212] flex items-center justify-center">
                    <model-viewer
                      src={selectedProduct.modelUrl}
                      alt={selectedProduct.name}
                      auto-rotate=""
                      camera-controls=""
                      shadow-intensity="1"
                      style={{ width: '100%', height: '224px' }}
                    ></model-viewer>
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 border border-[#FFC700] sb-mono text-xs text-[#FFC700] font-bold pointer-events-none">
                      R$ {Number(selectedProduct.price || 0).toFixed(2).replace('.', ',')}
                    </div>
                    <div className="absolute top-2 left-2 bg-[#FFC700] text-black px-2 py-1 text-[10px] font-black uppercase tracking-wider pointer-events-none">
                      3D VIEW
                    </div>
                  </div>
                ) : selectedProduct.imageUrl ? (
                  <div className="relative overflow-hidden border-2 border-[#333] bg-[#121212] group">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 border border-[#FFC700] sb-mono text-xs text-[#FFC700] font-bold">
                      R$ {Number(selectedProduct.price || 0).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-[#121212] border-2 border-dashed border-[#333] flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">🛹 🍔</span>
                    <span className="sb-mono text-[10px] text-[#777] uppercase tracking-wider">
                      Street Burger Artesanal
                    </span>
                  </div>
                )}

                <div>
                  <span className="sb-marker text-xs text-[#FFC700] inline-block -rotate-2">
                    street favorite
                  </span>
                  <h2 className="sb-display text-2xl sm:text-3xl uppercase text-[#F3F1E7] mt-1 leading-none">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9C9890] mt-2.5 leading-relaxed bg-[#121212] p-3.5 border border-[#2A2A2A]">
                    {selectedProduct.description ||
                      'Delicioso item preparado com ingredientes artesanais de alta qualidade.'}
                  </p>
                </div>
              </div>

              {/* Grupos de Customização / Adicionais */}
              <div className="space-y-5">
                {selectedProduct.customizationGroups &&
                selectedProduct.customizationGroups.length > 0 ? (
                  selectedProduct.customizationGroups.map((relation, idx) => {
                    const group = relation.customizationGroup || relation;
                    if (!group) return null;

                    const maxSelect = group.maxSelect || 1;
                    const groupIngredientIds = group.ingredients?.map((i) => i.id) || [];
                    const selectedInGroupCount = selectedIngredients.filter((i) =>
                      groupIngredientIds.includes(i.id)
                    ).length;

                    return (
                      <div
                        key={group.id || idx}
                        className="space-y-3 bg-[#121212] p-4 border border-[#2A2A2A]"
                      >
                        <div className="flex justify-between items-center">
                          <label className="sb-display text-xs text-[#FFC700] uppercase tracking-widest">
                            {group.title}
                          </label>
                          <span className="sb-mono text-[10px] text-[#9C9890]">
                            {maxSelect === 1
                              ? 'ESCOLHA 1'
                              : `${selectedInGroupCount}/${maxSelect} SELECIONADOS`}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {group.ingredients?.map((ing) => {
                            const isSelected = selectedIngredients.some(
                              (item) => item.id === ing.id
                            );
                            const ingPrice = Number(ing.price || 0);
                            const isGroupFull =
                              !isSelected &&
                              maxSelect > 1 &&
                              selectedInGroupCount >= maxSelect;

                            return (
                              <button
                                key={ing.id}
                                type="button"
                                disabled={isGroupFull}
                                onClick={() => toggleIngredient(ing, group)}
                                className={`w-full flex items-center justify-between p-3.5 border text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                                  isSelected
                                    ? 'border-[#FFC700] bg-[#FFC700]/5 text-white font-extrabold'
                                    : isGroupFull
                                    ? 'border-[#222] bg-[#161615] text-[#555] cursor-not-allowed'
                                    : 'border-[#333] bg-[#1B1B1A] text-[#9C9890] hover:text-white hover:border-[#555]'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-4 h-4 flex items-center justify-center border transition-all ${
                                      isSelected
                                        ? 'bg-[#FFC700] border-[#FFC700] text-black'
                                        : 'border-[#555]'
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check size={10} className="stroke-[4px] sb-check-pop" />
                                    )}
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
                  <p className="text-xs text-[#9C9890] italic text-center py-3 bg-[#121212] border border-[#2A2A2A]">
                    Nenhum adicional disponível para este item.
                  </p>
                )}
              </div>

              {/* Campo de Observações */}
              <div className="space-y-2 bg-[#121212] p-4 border border-[#2A2A2A]">
                <label className="sb-display text-xs text-[#FFC700] uppercase tracking-widest">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Sem cebola, ponto da carne mal passado, molho à parte..."
                  rows={2}
                  className="w-full bg-[#1B1B1A] border border-[#333] p-3 text-xs text-white focus:border-[#FFC700] outline-none resize-none transition-all placeholder:text-[#666]"
                />
              </div>

              {/* Rodapé do Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-dashed border-[#3A3A3A]">
                <div className="flex items-center gap-2 bg-[#121212] border border-[#333] p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 font-black text-white hover:text-[#FFC700] transition-all flex items-center justify-center text-lg active:scale-90 cursor-pointer"
                  >
                    -
                  </button>
                  <span
                    key={quantity}
                    className="sb-mono font-bold text-white text-sm w-6 text-center sb-pop"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 font-black text-white hover:text-[#FFC700] transition-all flex items-center justify-center text-lg active:scale-90 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  ref={confirmBtnRef}
                  type="button"
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

        {/* Barra Fixa Inferior do Carrinho */}
        {(cart?.length || 0) > 0 && (
          <div
            ref={cartBarRef}
            className={`fixed bottom-0 left-0 right-0 bg-[#1B1B1A] border-t-2 border-[#FFC700] p-4 shadow-2xl z-40 ${
              cartBump ? 'sb-cart-bump' : ''
            }`}
            style={{ animation: 'sb-fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            <div className="sb-ticket-edge absolute -top-2 left-0 right-0 h-2" />
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div>
                <p className="sb-mono text-[10px] text-[#9C9890] uppercase tracking-wider">
                  Total sem entrega
                </p>
                <p key={cartTotal} className="sb-display text-2xl text-[#FFC700] sb-pop">
                  R$ {Number(cartTotal || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
              <button
                onClick={() => navigate(`/${slug}/checkout`)}
                className="sb-stencil-btn bg-[#FFC700] text-black font-black px-6 py-3.5 flex items-center gap-2 uppercase tracking-wider text-xs cursor-pointer"
              >
                <ShoppingCart size={17} className="stroke-[2.5px]" /> Ver Carrinho ({totalCartQuantity})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}