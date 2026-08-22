import { z } from 'zod';

const orderTypeEnum = z.enum(['DINE_IN', 'TAKEOUT', 'DELIVERY']);
const orderStatusEnum = z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELED', 'CANCELLED']);

export const createOrderSchema = z.object({
  tenantId: z.string({
    required_error: 'O ID do tenant é obrigatório.',
  }).uuid('O ID do tenant deve ser um UUID válido.'),
  
  customerName: z.string({
    required_error: 'O nome do cliente é obrigatório.',
  }).min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .trim(),
  
  customerPhone: z.string().optional().nullable(),
  
  deliveryAddress: z.string().optional().nullable(),
  
  paymentMethod: z.string().optional().default('PIX'),
  
  type: orderTypeEnum.optional().default('DELIVERY'),
  
  tableNumber: z.string().optional().nullable(),
  
  notes: z.string().optional().nullable(),
  
  items: z.array(
    z.object({
      productId: z.string({
        required_error: 'O ID do produto é obrigatório.',
      }).uuid('ID de produto inválido.'),
      
      quantity: z.number({
        required_error: 'A quantidade é obrigatória.',
      }).int().positive('A quantidade deve ser um número inteiro positivo.'),
      
      notes: z.string().optional().nullable(),
      
      selectedIngredients: z.array(
        z.union([
          z.string().uuid('ID de ingrediente inválido.'),
          z.object({
            id: z.string().uuid('ID de ingrediente inválido.'),
          }),
          z.object({
            ingredientId: z.string().uuid('ID de ingrediente inválido.'),
          }),
        ])
      ).optional().default([]),
    })
  ).nonempty('O pedido deve conter pelo menos um item.'),
}).refine((data) => {
  if (data.type === 'DELIVERY' && (!data.deliveryAddress || data.deliveryAddress.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'O endereço de entrega é obrigatório para pedidos do tipo DELIVERY.',
  path: ['deliveryAddress'],
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
});
