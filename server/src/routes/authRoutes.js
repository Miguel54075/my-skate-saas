import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validation.js';
import { registerTenantSchema, loginSchema } from '../schemas/authSchemas.js';

const routes = Router();

// Rotas públicas com validação Zod
routes.post('/register-tenant', validate(registerTenantSchema), authController.registerTenant);
routes.post('/login', validate(loginSchema), authController.login);

// Rota protegida
routes.get('/me', authMiddleware, authController.me);

export default routes;