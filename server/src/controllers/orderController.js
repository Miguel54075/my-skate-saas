import prisma from '../config/prisma.js';

class OrderController {
  async createOrder(req, res) {
    try {
      const { tenantId, customerName, customerPhone, deliveryAddress, items, paymentMethod, type, tableNumber, notes } = req.body;

      if (!tenantId || !customerName || !items || items.length === 0) {
        return res.status(400).json({ error: 'Dados incompletos para processar o pedido.' });
      }

      let calculatedTotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return res.status(404).json({ error: `Produto ID ${item.productId} não encontrado.` });
        }

        let unitPrice = Number(product.price);
        let itemTotal = unitPrice;
        const ingredientsToCreate = [];

        // Processa os ingredientes/adicionais enviados
        if (item.selectedIngredients && item.selectedIngredients.length > 0) {
          const idsToSearch = [];

          for (const ing of item.selectedIngredients) {
            if (typeof ing === 'string' && ing.trim() !== '') {
              idsToSearch.push(ing);
            } else if (typeof ing === 'object' && ing !== null) {
              if (ing.id) idsToSearch.push(String(ing.id));
              else if (ing.ingredientId) idsToSearch.push(String(ing.ingredientId));
            }
          }

          if (idsToSearch.length > 0) {
            const foundIngredients = await prisma.ingredient.findMany({
              where: { id: { in: idsToSearch } },
            });

            for (const dbIng of foundIngredients) {
              const ingPrice = Number(dbIng.price || 0);
              itemTotal += ingPrice; // Soma o preço do adicional ao total do item

              ingredientsToCreate.push({
                ingredientId: dbIng.id,
                quantity: 1,
                unitPrice: ingPrice, // Salva o preço real do adicional no banco!
              });
            }
          }
        }

        const itemSubtotal = itemTotal * item.quantity;
        calculatedTotal += itemSubtotal;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: unitPrice,
          subtotal: itemSubtotal,
          notes: item.notes || null,
          selectedIngredients: ingredientsToCreate.length > 0 ? {
            create: ingredientsToCreate,
          } : undefined,
        });
      }

      const order = await prisma.order.create({
        data: {
          tenantId,
          customerName,
          customerPhone,
          deliveryAddress,
          paymentMethod: paymentMethod || 'PIX',
          type: type || 'DELIVERY',
          tableNumber: tableNumber || null,
          notes: notes || null,
          total: calculatedTotal,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
              selectedIngredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      });

      // Emite o evento via Socket.io para atualizar a cozinha em tempo real
      req.io.to(tenantId).emit('newOrder', order);

      return res.status(201).json(order);
    } catch (error) {
      console.error('Erro detalhado no servidor:', error);
      return res.status(500).json({ error: 'Erro ao registrar o pedido.' });
    }
  }
  async deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const order = await prisma.order.findFirst({
      where: { id, tenantId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    await prisma.order.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    return res.status(500).json({ error: 'Erro ao excluir pedido.' });
  }
}

  async getTenantOrders(req, res) {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant não identificado.' });
      }

      const orders = await prisma.order.findMany({
        where: { tenantId },
        include: {
          items: {
            include: {
              product: true,
              selectedIngredients: {
                include: {
                  ingredient: true // Garante que puxa o nome do ingrediente do banco
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(orders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      // Pega o ID da URL
      const { id } = req.params;
      const { status } = req.body;
      
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant não identificado.' });
      }

      const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELED', 'CANCELLED'];
      
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status inválido recebido: ${status}` });
      }

      const orderExists = await prisma.order.findFirst({
        where: { id, tenantId },
      });

      if (!orderExists) {
        return res.status(404).json({ error: 'Pedido não encontrado para este tenant.' });
      }

      // Correção aplicada aqui: where: { id: id } (ou apenas where: { id })
      const updatedOrder = await prisma.order.update({
        where: { id: id }, 
        data: { status: status.toUpperCase() }
      });

      req.io.to(tenantId).emit('orderStatusUpdated', updatedOrder);

      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Erro detalhado ao atualizar status:', error);
      return res.status(500).json({ error: 'Erro ao atualizar status do pedido.' });
    }
  }
}

export default new OrderController();