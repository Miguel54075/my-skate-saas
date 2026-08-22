import prisma from '../config/prisma.js';

class IngredientController {
  // Busca todos os ingredientes disponíveis para o cardápio público do cliente
  async getPublicIngredients(req, res) {
    try {
      const { tenantId } = req.params;

      const ingredients = await prisma.ingredient.findMany({
        where: {
          tenantId: tenantId,
          available: true, // Traz apenas os que não estão em falta no estoque
        },
        orderBy: {
          name: 'asc' // Ordena em ordem alfabética
        }
      });

      return res.status(200).json(ingredients);
    } catch (error) {
      console.error('Erro ao buscar ingredientes públicos:', error);
      return res.status(500).json({ error: 'Erro ao buscar ingredientes.' });
    }
  }
  // Deletar Ingrediente
  async deleteIngredient(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;

      // Verifica se o ingrediente pertence ao tenant
      const ingredient = await prisma.ingredient.findUnique({
        where: {
          id: id,
          tenantId: tenantId
        }
      });

      if (!ingredient) {
        return res.status(404).json({ error: 'Ingrediente não encontrado.' });
      }

      await prisma.ingredient.delete({
        where: {
          id: id
        }
      });

      return res.status(200).json({ message: 'Ingrediente excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir ingrediente:', error);
      return res.status(500).json({ error: 'Erro ao excluir ingrediente.' });
    }
  }
}

export default new IngredientController();