import { Router } from 'express';
import ingredientController from '../controllers/ingredientController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// Rota pública (não precisa de autenticação, pois é o cliente olhando o cardápio)
router.get('/public/:tenantId', ingredientController.getPublicIngredients);

// Rotas protegidas
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), ingredientController.deleteIngredient);

export default router;