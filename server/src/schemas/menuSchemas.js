import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string({
    required_error: 'O nome da categoria é obrigatório.',
  }).min(2, 'O nome da categoria deve ter pelo menos 2 caracteres.')
    .trim(),
  
  icon: z.string().optional().nullable(),
  
  order: z.number().int().optional().default(0),
});

export const createProductSchema = z.object({
  categoryId: z.string({
    required_error: 'A categoria do produto é obrigatória.',
  }).uuid('ID de categoria inválido.'),
  
  name: z.string({
    required_error: 'O nome do produto é obrigatório.',
  }).min(2, 'O nome do produto deve ter pelo menos 2 caracteres.')
    .trim(),
  
  description: z.string().optional().nullable(),
  
  price: z.preprocess((val) => Number(val), z.number({
    required_error: 'O preço é obrigatório.',
  }).nonnegative('O preço não pode ser negativo.')),
  
  imageUrl: z.string().optional().nullable(),
  
  isCustomizable: z.boolean().optional().default(true),
  
  customizationGroupIds: z.array(z.string().uuid('ID de grupo inválido.')).optional().default([]),
});

// Nota: Esta rota cria ingredientes em lote em múltiplos grupos
export const batchCreateIngredientSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  price: z.preprocess((val) => val ? Number(val) : 0, z.number().nonnegative('O preço não pode ser negativo.').optional().default(0)),
  customizationGroupIds: z.array(z.string().uuid('ID de grupo inválido.')).optional(),
}).refine((data) => {
  return data.name || data.title;
}, {
  message: 'O nome do ingrediente é obrigatório (use name ou title).',
  path: ['name'],
});

export const createIngredientSchema = z.object({
  customizationGroupId: z.string({
    required_error: 'O ID do grupo de customização é obrigatório.',
  }).uuid('ID de grupo inválido.'),
  
  name: z.string({
    required_error: 'O nome do ingrediente é obrigatório.',
  }).min(1, 'O nome do ingrediente é obrigatório.')
    .trim(),
  
  price: z.preprocess((val) => val ? Number(val) : 0, z.number().nonnegative('O preço não pode ser negativo.').optional().default(0)),
});

export const linkGroupToProductSchema = z.object({
  productId: z.string({
    required_error: 'O ID do produto é obrigatório.',
  }).uuid('ID de produto inválido.'),
  
  customizationGroupId: z.string({
    required_error: 'O ID do grupo de customização é obrigatório.',
  }).uuid('ID de grupo inválido.'),
});
