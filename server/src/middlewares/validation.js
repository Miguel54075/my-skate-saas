import { z } from 'zod';

/**
 * Middleware para validar o request contra um schema do Zod
 * @param {z.ZodObject} schema - Esquema de validação Zod
 * @returns {Function} Express Middleware
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      // Valida o req.body contra o schema
      const validatedData = await schema.parseAsync(req.body);
      // Substitui o req.body pelos dados higienizados e validados
      req.body = validatedData;
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          error: 'Falha na validação dos dados de entrada.',
          details: errorMessages,
        });
      }
      return res.status(500).json({ error: 'Erro interno ao validar dados.' });
    }
  };
}
