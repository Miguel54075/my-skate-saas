import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Tag, Utensils, Layers, ArrowLeft, Trash2, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export function AdminMenu() {
  const navigate = useNavigate();
  const toast = useToast();

  // Estados de dados
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para formulários
  const [categoryName, setCategoryName] = useState('');

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productModelUrl, setProductModelUrl] = useState('');

  const [ingredientName, setIngredientName] = useState('');
  const [ingredientPrice, setIngredientPrice] = useState('');

  // NOVO: Estado para armazenar os IDs das categorias selecionadas no cadastro de adicional
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('@streetburger:token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  async function loadData() {
    try {
      setLoading(true);
      const categoriesRes = await api.get('/menu/categories');
      const fetchedCategories = categoriesRes.data || [];

      setCategories(fetchedCategories);

      if (fetchedCategories.length > 0 && !productCategoryId) {
        setProductCategoryId(fetchedCategories[0].id);
      }

      // Se sua API de ingredients retornar a lista, você pode atualizar aqui também (opcional)
      // const ingredientsRes = await api.get('/ingredients');
      // setIngredients(ingredientsRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.delete(`/menu/categories/${id}`);
      loadData();
      toast.success('Categoria excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      toast.error('Erro ao excluir categoria.');
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await api.delete(`/menu/products/${id}`);
      loadData();
      toast.success('Produto excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      toast.error('Erro ao excluir produto.');
    }
  }

  async function handleDeleteIngredient(id) {
    if (!window.confirm('Tem certeza que deseja excluir este adicional?')) return;
    try {
      await api.delete(`/ingredients/${id}`);
      loadData();
      toast.success('Adicional excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir adicional:', err);
      toast.error('Erro ao excluir adicional.');
    }
  }

  // Criar Categoria
  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!categoryName) return;

    try {
      await api.post('/menu/categories', { name: categoryName });
      setCategoryName('');
      loadData();
      toast.success('Categoria criada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao criar categoria.');
    }
  }

  // Criar Produto Simples
  async function handleCreateProduct(e) {
    e.preventDefault();
    if (!productName || !productPrice || !productCategoryId) return;

    try {
      await api.post('/menu/products', {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        categoryId: productCategoryId,
        imageUrl: productImageUrl,
        modelUrl: productModelUrl,
        isCustomizable: true,
      });

      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductImageUrl('');
      setProductModelUrl('');
      loadData();
      toast.success('Produto cadastrado com sucesso!');
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err);
      toast.error('Erro ao cadastrar produto.');
    }
  }

  // Toggle de seleção de categoria para o Adicional
  function handleToggleCategorySelection(catId) {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  }

  // Criar Adicional/Ingrediente vinculado a categorias específicas
  async function handleCreateIngredient(e) {
    e.preventDefault();

    if (!ingredientName || !ingredientPrice) {
      toast.warning('Preencha o nome e o preço do adicional.');
      return;
    }

    if (selectedCategoryIds.length === 0) {
      toast.warning('Selecione pelo menos uma categoria onde este adicional vai aparecer.');
      return;
    }

    try {
      // Ajuste para enviar as categorias selecionadas para o backend processar os grupos dinamicamente
      await api.post('/menu/customization-groups', {
        title: ingredientName, // Ou nome do grupo/adicional
        price: Number(ingredientPrice),
        categoryIds: selectedCategoryIds,
      });

      setIngredientName('');
      setIngredientPrice('');
      setSelectedCategoryIds([]);
      loadData();
      toast.success('Adicional cadastrado e vinculado com sucesso! 🥓');
    } catch (err) {
      console.error('Erro ao cadastrar ingrediente:', err.response?.data || err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Erro ao cadastrar adicional.');
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F1E7] p-4 sm:p-6 relative">
      <div className="sb-root">
        <div className="sb-grain" />

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-dashed border-[#333] pb-4 relative">
            <div>
              <button
                onClick={() => navigate('/admin/kds')}
                className="flex items-center gap-1 text-xs text-[#9C9890] hover:text-[#FFC700] mb-2 transition-colors font-semibold"
              >
                <ArrowLeft size={14} /> Voltar ao KDS
              </button>
              <h1 className="sb-display text-2xl sm:text-3xl uppercase tracking-wide flex items-center gap-2 text-[#F3F1E7]">
                <Utensils size={28} className="text-[#FFC700]" /> Gestão do <span className="text-[#FFC700]">Cardápio</span>
              </h1>
            </div>
            <span className="hidden sm:block sb-mono text-[10px] text-[#121212] bg-[#FFC700] px-2.5 py-1 rotate-2">
              PAINEL ADMIN
            </span>
          </div>

          {/* Formulários de Cadastro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Nova Categoria */}
            <form
              onSubmit={handleCreateCategory}
              className="relative bg-[#1B1B1A] border border-[#333] p-5 space-y-4 sb-fade-up"
              style={{ transform: 'rotate(-0.4deg)' }}
            >
              <span className="sb-tape rotate-[-6deg]" style={{ top: -8, left: 18 }} />
              <h2 className="sb-display text-base uppercase tracking-wide flex items-center gap-2 border-b border-dashed border-[#3A3A3A] pb-3 text-white">
                <Layers className="text-[#FFC700]" size={18} /> Nova Categoria
              </h2>
              <div>
                <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">Nome</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Combos, Bebidas"
                  className="sb-input w-full p-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                className="sb-stencil-btn w-full bg-[#FFC700] text-black font-black py-2.5 flex items-center justify-center gap-1.5 text-xs uppercase cursor-pointer"
              >
                <Plus size={16} /> Salvar Categoria
              </button>
            </form>

            {/* Novo Produto */}
            <form
              onSubmit={handleCreateProduct}
              className="relative bg-[#1B1B1A] border border-[#333] p-5 space-y-4 sb-fade-up"
              style={{ transform: 'rotate(0.4deg)', animationDelay: '60ms' }}
            >
              <span className="sb-tape rotate-[6deg]" style={{ top: -8, right: 18 }} />
              <h2 className="sb-display text-base uppercase tracking-wide flex items-center gap-2 border-b border-dashed border-[#3A3A3A] pb-3 text-white">
                <Utensils className="text-[#FFC700]" size={18} /> Novo Produto
              </h2>
              <div>
                <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">
                  Nome do Lanche/Item
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Double Bacon Burger"
                  className="sb-input w-full p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">
                  Descrição
                </label>
                <input
                  type="text"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Ex: Pão australiano, 2x carnes..."
                  className="sb-input w-full p-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="32.90"
                    className="sb-input w-full p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">
                    Categoria
                  </label>
                  <select
                    value={productCategoryId}
                    onChange={(e) => setProductCategoryId(e.target.value)}
                    className="sb-input w-full p-2.5 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">
                  URL da Imagem (Opcional)
                </label>
                <input
                  type="url"
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="sb-input w-full p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">
                  URL do Modelo 3D (.glb ou .gltf - Opcional)
                </label>
                <input
                  type="url"
                  value={productModelUrl}
                  onChange={(e) => setProductModelUrl(e.target.value)}
                  placeholder="https://exemplo.com/hamburguer.glb"
                  className="sb-input w-full p-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="sb-stencil-btn w-full bg-[#FFC700] text-black font-black py-2.5 flex items-center justify-center gap-1.5 text-xs uppercase cursor-pointer"
              >
                <Plus size={16} /> Cadastrar Produto
              </button>
            </form>

            {/* Novo Adicional com Seleção de Categorias */}
            <form
              onSubmit={handleCreateIngredient}
              className="relative bg-[#1B1B1A] border border-[#333] p-5 space-y-4 sb-fade-up"
              style={{ transform: 'rotate(-0.3deg)', animationDelay: '120ms' }}
            >
              <span className="sb-tape rotate-[-5deg]" style={{ top: -8, left: '50%', marginLeft: -21 }} />
              <h2 className="sb-display text-base uppercase tracking-wide flex items-center gap-2 border-b border-dashed border-[#3A3A3A] pb-3 text-white">
                <Tag className="text-[#FFC700]" size={18} /> Novo Adicional
              </h2>

              <div>
                <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">
                  Nome do Adicional
                </label>
                <input
                  type="text"
                  required
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  placeholder="Ex: Molho Especial, Bacon Extra"
                  className="sb-input w-full p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1 sb-mono">
                  Preço Extra (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={ingredientPrice}
                  onChange={(e) => setIngredientPrice(e.target.value)}
                  placeholder="4.50"
                  className="sb-input w-full p-2.5 text-sm"
                />
              </div>

              {/* SELETOR DE CATEGORIAS PARA O ADICIONAL */}
              <div>
                <label className="block text-[10px] font-bold text-[#9C9890] uppercase tracking-widest mb-1.5 sb-mono">
                  Aplicar nas Categorias
                </label>
                <div className="sb-input p-2.5 max-h-36 overflow-y-auto space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-xs text-[#9C9890] italic">Cadastre uma categoria primeiro.</p>
                  ) : (
                    categories.map((cat) => {
                      const isSelected = selectedCategoryIds.includes(cat.id);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleToggleCategorySelection(cat.id)}
                          className="flex items-center gap-2 cursor-pointer text-xs text-white hover:text-[#FFC700] transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#FFC700]" />
                          ) : (
                            <Square size={16} className="text-[#9C9890]" />
                          )}
                          <span>{cat.name}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="sb-stencil-btn w-full bg-[#FFC700] text-black font-black py-2.5 flex items-center justify-center gap-1.5 text-xs uppercase cursor-pointer"
              >
                <Plus size={16} /> Cadastrar Adicional
              </button>
            </form>
          </div>

          {/* Visualização do Cardápio */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 sb-hazard" />
              <h2 className="sb-display text-lg uppercase tracking-wide text-white">Cardápio Cadastrado</h2>
            </div>

            <div className="space-y-5">
              {categories.map((category) => (
                <div key={category.id} className="bg-[#1B1B1A] border border-[#333] p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-dashed border-[#3A3A3A] pb-3">
                    <h3 className="sb-display text-[#FFC700] text-base uppercase tracking-wide">{category.name}</h3>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-[#FF3B2F] hover:text-red-400 p-1.5 bg-[#FF3B2F]/10 border border-[#FF3B2F]/20 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      <Trash2 size={14} /> Excluir Categoria
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.products?.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-[#121212] border border-[#2A2A2A] p-3.5 flex justify-between items-start gap-3"
                      >
                        <div>
                          <p className="font-bold text-white text-sm">{prod.name}</p>
                          <p className="text-xs text-[#9C9890]">{prod.description}</p>
                          <p className="sb-mono text-[#FFC700] font-bold text-sm mt-1">
                            R$ {Number(prod.price).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="text-[#FF3B2F]/70 hover:text-[#FF3B2F] p-1 transition-colors cursor-pointer"
                          title="Excluir produto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Listagem de Adicionais */}
            {ingredients.length > 0 && (
              <div className="bg-[#1B1B1A] border border-[#333] p-5 space-y-4 mt-6">
                <h3 className="sb-display text-[#FF3B2F] text-base uppercase tracking-wide border-b border-dashed border-[#3A3A3A] pb-3">
                  Adicionais Cadastrados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="bg-[#121212] border border-[#2A2A2A] p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{ing.name}</p>
                        <p className="sb-mono text-[#FFC700] text-xs font-bold">
                          R$ {Number(ing.price).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteIngredient(ing.id)}
                        className="text-[#FF3B2F]/70 hover:text-[#FF3B2F] p-1 transition-colors cursor-pointer"
                        title="Excluir adicional"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}