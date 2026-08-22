import { z } from 'zod';

export const registerTenantSchema = z.object({
  tenantName: z.string({
    required_error: 'O nome da hamburgueria é obrigatório.',
  }).min(3, 'O nome da hamburgueria deve ter pelo menos 3 caracteres.')
    .max(50, 'O nome da hamburgueria deve ter no máximo 50 caracteres.')
    .trim(),
  
  slug: z.string({
    required_error: 'O endereço (slug) é obrigatório.',
  }).min(3, 'O slug deve ter pelo menos 3 caracteres.')
    .max(30, 'O slug deve ter no máximo 30 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'O slug deve conter apenas letras minúsculas, números e hifens.')
    .trim(),
  
  name: z.string({
    required_error: 'O nome do administrador é obrigatório.',
  }).min(2, 'O nome do administrador deve ter pelo menos 2 caracteres.')
    .trim(),
  
  email: z.string({
    required_error: 'O e-mail é obrigatório.',
  }).email('Formato de e-mail inválido.')
    .trim(),
  
  password: z.string({
    required_error: 'A senha é obrigatória.',
  }).min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  
  phone: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string({
    required_error: 'O e-mail é obrigatório.',
  }).email('Formato de e-mail inválido.')
    .trim(),
  
  password: z.string({
    required_error: 'A senha é obrigatória.',
  }).min(1, 'A senha é obrigatória.'),
});
