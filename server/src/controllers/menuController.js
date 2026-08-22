import prisma from '../config/prisma.js';

class MenuController {
  // 1. Criar Categoria (ex: "Lanches Street", "Bebidas", "Acompanhamentos")
  async createCategory(req, res) {
    try {
      const { name, icon, order } = req.body;
      const { tenantId } = req.user;

      if (!name) {
        return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
      }

      const category = await prisma.category.create({
        data: {
          tenantId,
          name,
          icon,
          order: order || 0,
        },
      });

      await prisma.customizationGroup.create({
      data: {
        title: `Adicionais para ${name}`,
        tenantId,
        minSelect: 0,
        maxSelect: 1,
        // Já vincula o grupo à categoria recém-criada
        categories: {
          create: {
            categoryId: category.id
          }
        }
      }
    });

      return res.status(201).json(category);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).json({ error: 'Erro ao criar categoria.' });
    }
  }

  // 2. Criar Grupo de Customização (ex: "Adicionais do Hamburguer", "Opções de Molho")
 async createCustomizationGroup(req, res) {
  try {
    // Aceita tanto 'name' quanto 'title' caso o front-end envie com outro nome
    const ingredientName = req.body.name || req.body.title;
    const { price, customizationGroupIds } = req.body;
    const tenantId = req.tenantId || req.user?.tenantId; 

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado na requisição.' });
    }

    if (!ingredientName) {
      return res.status(400).json({ error: 'O nome do ingrediente/adicional é obrigatório.' });
    }

    // Seus IDs dos grupos fixos (ou os que vieram do front)
    const groupIdsToUse = customizationGroupIds || [
      "3ccd8e45-3520-470f-8282-17314cdff5f9",
      "623d6643-634f-492c-8c6c-a34420654688",
      "0ca92726-66f6-4e50-92fc-57530ce4af5d"
    ];

    if (!groupIdsToUse || groupIdsToUse.length === 0) {
      return res.status(400).json({ error: 'Selecione pelo menos um grupo de customização.' });
    }

    // Cria o ingrediente em todos os grupos informados
    const createdIngredients = await prisma.ingredient.createMany({
      data: groupIdsToUse.map((groupId) => ({
        name: ingredientName,
        price: parseFloat(price) || 0,
        tenantId,
        customizationGroupId: groupId,
      })),
      skipDuplicates: true,
    });

    return res.status(201).json({ 
      message: 'Adicional adicionado com sucesso aos grupos!', 
      count: createdIngredients.count 
    });
    
  } catch (err) {
    console.error('Erro ao adicionar ingrediente nos múltiplos grupos:', err);
    return res.status(500).json({ error: err.message || 'Erro interno ao adicionar ingrediente.' });
  }
}

  // 3. Cadastrar Ingrediente/Adicional em um Grupo (ex: "Bacon Extra - R$ 4,50")
  async createIngredient(req, res) {
    try {
      const { customizationGroupId, name, price } = req.body;
      const { tenantId } = req.user;

      if (!customizationGroupId || !name) {
        return res.status(400).json({ error: 'Grupo de customização e nome do ingrediente são obrigatórios.' });
      }

      const ingredient = await prisma.ingredient.create({
        data: {
          tenantId,
          customizationGroupId,
          name,
          price: price || 0.00,
        },
      });

      return res.status(201).json(ingredient);
    } catch (error) {
      console.error('Erro ao cadastrar ingrediente:', error);
      return res.status(500).json({ error: 'Erro ao cadastrar ingrediente.' });
    }
  }

  // 4. Criar Produto Simples (sem exigir seleção de grupo na gestão)
  async createProduct(req, res) {
    try {
      const { categoryId, name, description, price, imageUrl, isCustomizable, customizationGroupIds } = req.body;
      const { tenantId } = req.user;

      if (!categoryId || !name || price === undefined) {
        return res.status(400).json({ error: 'Categoria, nome e preço são obrigatórios.' });
      }

      // Cria o produto
      const product = await prisma.product.create({
        data: {
          tenantId,
          categoryId,
          name,
          description,
          price,
          imageUrl,
          isCustomizable: isCustomizable ?? true,
        },
      });

      // Se foram enviados IDs de grupos de customização, vincula eles ao produto
      if (customizationGroupIds && customizationGroupIds.length > 0) {
        const relations = customizationGroupIds.map(groupId => ({
          productId: product.id,
          customizationGroupId: groupId,
        }));

        await prisma.productCustomizationGroup.createMany({
          data: relations,
        });
      }

      return res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      return res.status(500).json({ error: 'Erro ao cadastrar produto.' });
    }
  }

  /*async seedGroupsInsert(req, res) {
    try {

      const groups = [
        { title: 'Adicionais das Bebidas', description: 'Adicionais das Bebidas', minSelect: 0, maxSelect: 3, tenantId: "b122780a-1fcc-41f9-8137-6672d9a2e28c" }
      ];

      await prisma.customizationGroup.createMany({ data: groups });
      return res.json({ message: 'Grupos criados!' });
    } catch (error) {
      console.error('Erro ao criar grupos:', error);
      return res.status(500).json({ error: 'Erro ao criar grupos.' });
    }
  } */

  /* async seedIngredientsCreate(req, res) {
  const tenantId = "b122780a-1fcc-41f9-8137-6672d9a2e28c";
  const groupId = "3ccd8e45-3520-470f-8282-17314cdff5f9";

  // 2. Insere os novos ingredientes corretos
  const ingredientsToCreate = [
    { name: 'Bacon Extra', price: 3.00, customizationGroupId: groupId, tenantId },
    { name: 'Queijo Extra', price: 2.50, customizationGroupId: groupId, tenantId },
    { name: 'Ovo', price: 2.00, customizationGroupId: groupId, tenantId },
    { name: 'Carne (120g)', price: 18.00, customizationGroupId: groupId, tenantId },
    { name: 'Carne (200g)', price: 25.00, customizationGroupId: groupId, tenantId },
    { name: 'Salada Extra', price: 2.00, customizationGroupId: groupId, tenantId },
    { name: 'Molho Louco Extra', price: 2.50, customizationGroupId: groupId, tenantId },
    { name: 'Molho Pimenta Extra', price: 2.50, customizationGroupId: groupId, tenantId }
  ];

  await prisma.ingredient.createMany({ 
    data: ingredientsToCreate 
  });

  return res.json({ message: 'Ingredientes criados com sucesso!' });
}
*/

  // 5. Rota Pública: Retorna o Cardápio do Cliente + Todos os Adicionais disponíveis da Hamburgueria
  async getPublicMenu(req, res) {
  try {
    const { slug } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { active: true },
          include: {
            products: {
              where: { active: true },
              include: {
                customizationGroups: {
                  include: {
                    customizationGroup: {
                      include: {
                        ingredients: {
                          where: { available: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Cardápio não encontrado' });
    }

    return res.json(tenant); // <-- Certifique-se de que está retornando o tenant ou as categories!
  } catch (err) {
    console.error('Erro ao buscar cardápio público:', err);
    return res.status(500).json({ error: 'Erro interno ao carregar cardápio' });
  }
}

  // 6. Listar Categorias para o Painel Admin (Trazendo apenas as ativas)
  async getCategories(req, res) {
    try {
      const tenantId = req.user?.tenantId || req.tenantId;

      const categories = await prisma.category.findMany({
        where: { tenantId, active: true },
        include: {
          products: {
            where: { active: true },
          },
        },
      });

      return res.json(categories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({ error: 'Erro ao buscar categorias do cardápio.' });
    }
  }

  // 7. Listar Grupos e Adicionais para o Painel Admin
  async getCustomizationGroups(req, res) {
    try {
      const tenantId = req.user?.tenantId || req.tenantId;

      const groups = await prisma.customizationGroup.findMany({
        where: { tenantId },
        include: {
          ingredients: true,
        },
      });

      return res.json(groups);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return res.status(500).json({ error: 'Erro ao buscar grupos de customização.' });
    }
  }

  // 8. Vincular Grupo ao Produto
  async linkGroupToProduct(req, res) {
    try {
      const { productId, customizationGroupId } = req.body;
      const { tenantId } = req.user;

      // Garante que o produto pertence ao tenant do usuário logado
      const productExists = await prisma.product.findFirst({
        where: { id: productId, tenantId },
      });

      if (!productExists) {
        return res.status(404).json({ error: 'Produto não encontrado neste tenant.' });
      }

      // Garante que o grupo pertence ao tenant do usuário logado
      const groupExists = await prisma.customizationGroup.findFirst({
        where: { id: customizationGroupId, tenantId },
      });

      if (!groupExists) {
        return res.status(404).json({ error: 'Grupo de customização não encontrado neste tenant.' });
      }

      // Verifica se a relação já existe para evitar erros de unique constraint
      const existingRelation = await prisma.productCustomizationGroup.findUnique({
        where: {
          productId_customizationGroupId: {
            productId,
            customizationGroupId,
          },
        },
      });

      if (existingRelation) {
        return res.status(200).json(existingRelation);
      }

      const relation = await prisma.productCustomizationGroup.create({
        data: {
          productId,
          customizationGroupId,
        },
      });

      return res.status(201).json(relation);
    } catch (error) {
      console.error('Erro ao vincular grupo:', error);
      return res.status(500).json({ error: 'Erro ao vincular grupo de customização ao produto.' });
    }
  }

  // 9. Soft Delete (Inativar) Produto
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;

      const product = await prisma.product.updateMany({
        where: { id, tenantId },
        data: { active: false }
      });

      if (product.count === 0) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao inativar produto:', error);
      return res.status(500).json({ error: 'Erro ao inativar produto.' });
    }
  }

  // 10. Soft Delete (Inativar) Categoria
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;

      const category = await prisma.category.updateMany({
        where: { id, tenantId },
        data: { active: false }
      });

      if (category.count === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      // Inativa também os produtos pertencentes a esta categoria
      await prisma.product.updateMany({
        where: { categoryId: id, tenantId },
        data: { active: false }
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao inativar categoria:', error);
      return res.status(500).json({ error: 'Erro ao inativar categoria.' });
    }
  }
}

export default new MenuController();