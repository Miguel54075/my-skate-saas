import prisma from '../config/prisma.js';

class MenuController {
  // 1. Criar Categoria
  async createCategory(req, res) {
    try {
      const { name, icon, order } = req.body;
      const tenantId = req.user?.tenantId || req.tenantId;

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
          categories: {
            create: {
              categoryId: category.id,
            },
          },
        },
      });

      return res.status(201).json(category);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).json({ error: 'Erro ao criar categoria.' });
    }
  }

  // 2. Criar Ingrediente/Adicional nos Grupos de Customização
  async createCustomizationGroup(req, res) {
    try {
      const ingredientName = req.body.name || req.body.title;
      const { price, categoryIds, customizationGroupIds } = req.body;
      const tenantId = req.tenantId || req.user?.tenantId; 

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant não identificado na requisição.' });
      }

      if (!ingredientName) {
        return res.status(400).json({ error: 'O nome do ingrediente/adicional é obrigatório.' });
      }

      let groupIdsToUse = [];

      if (categoryIds && categoryIds.length > 0) {
        const categoryGroups = await prisma.categoryCustomizationGroup.findMany({
          where: {
            categoryId: { in: categoryIds },
            customizationGroup: { tenantId },
          },
          select: {
            customizationGroupId: true,
          },
        });

        groupIdsToUse = [...new Set(categoryGroups.map((cg) => cg.customizationGroupId))];

        if (groupIdsToUse.length === 0) {
          return res.status(400).json({ 
            error: 'Nenhum grupo de customização encontrado para as categorias selecionadas.' 
          });
        }
      } else if (customizationGroupIds && customizationGroupIds.length > 0) {
        groupIdsToUse = customizationGroupIds;
      } else {
        return res.status(400).json({ error: 'Selecione pelo menos uma categoria para vincular o adicional.' });
      }

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

  // 3. Cadastrar Ingrediente em um Grupo
  async createIngredient(req, res) {
    try {
      const { customizationGroupId, name, price } = req.body;
      const tenantId = req.user?.tenantId || req.tenantId;

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

  // 4. Criar Produto Simples
  async createProduct(req, res) {
    try {
      const { categoryId, name, description, price, imageUrl, modelUrl, isCustomizable, customizationGroupIds } = req.body;
      const tenantId = req.user?.tenantId || req.tenantId;

      if (!categoryId || !name || price === undefined) {
        return res.status(400).json({ error: 'Categoria, nome e preço são obrigatórios.' });
      }

      const product = await prisma.product.create({
        data: {
          tenantId,
          categoryId,
          name,
          description,
          price,
          imageUrl,
          modelUrl,
          isCustomizable: isCustomizable ?? true,
        },
      });

      if (customizationGroupIds && customizationGroupIds.length > 0) {
        const relations = customizationGroupIds.map((groupId) => ({
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

  // 5. Rota Pública: Retorna o Cardápio do Cliente
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

      return res.json(tenant);
    } catch (err) {
      console.error('Erro ao buscar cardápio público:', err);
      return res.status(500).json({ error: 'Erro interno ao carregar cardápio' });
    }
  }

  // 6. Listar Categorias para o Painel Admin
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
      const tenantId = req.user?.tenantId || req.tenantId;

      const productExists = await prisma.product.findFirst({
        where: { id: productId, tenantId },
      });

      if (!productExists) {
        return res.status(404).json({ error: 'Produto não encontrado neste tenant.' });
      }

      const groupExists = await prisma.customizationGroup.findFirst({
        where: { id: customizationGroupId, tenantId },
      });

      if (!groupExists) {
        return res.status(404).json({ error: 'Grupo de customização não encontrado neste tenant.' });
      }

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

  // 9. Atualizar Categoria (PUT)
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, icon, order } = req.body;
      const tenantId = req.user?.tenantId || req.tenantId;

      const updatedCategory = await prisma.category.updateMany({
        where: { id, tenantId },
        data: {
          ...(name && { name }),
          ...(icon !== undefined && { icon }),
          ...(order !== undefined && { order }),
        },
      });

      if (updatedCategory.count === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      return res.json({ message: 'Categoria atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return res.status(500).json({ error: 'Erro ao atualizar categoria.' });
    }
  }

  // 10. Atualizar Produto (PUT)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { categoryId, name, description, price, imageUrl, modelUrl, isCustomizable } = req.body;
      const tenantId = req.user?.tenantId || req.tenantId;

      const updatedProduct = await prisma.product.updateMany({
        where: { id, tenantId },
        data: {
          ...(categoryId && { categoryId }),
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(modelUrl !== undefined && { modelUrl }),
          ...(isCustomizable !== undefined && { isCustomizable }),
        },
      });

      if (updatedProduct.count === 0) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      return res.json({ message: 'Produto atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
  }

  // 11. Soft Delete (Inativar) Produto
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId || req.tenantId;

      const product = await prisma.product.updateMany({
        where: { id, tenantId },
        data: { active: false },
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

  // 12. Soft Delete (Inativar) Categoria
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId || req.tenantId;

      const category = await prisma.category.updateMany({
        where: { id, tenantId },
        data: { active: false },
      });

      if (category.count === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      await prisma.product.updateMany({
        where: { categoryId: id, tenantId },
        data: { active: false },
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao inativar categoria:', error);
      return res.status(500).json({ error: 'Erro ao inativar categoria.' });
    }
  }
}

export default new MenuController();