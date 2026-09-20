import { Router } from 'express';
import menuController from '../controllers/menuController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validation.js';
import {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  batchCreateIngredientSchema,
  createIngredientSchema,
  linkGroupToProductSchema,
} from '../schemas/menuSchemas.js';

const routes = Router();

// Rotas Públicas
routes.get('/public/:slug', menuController.getPublicMenu);

// Rotas Privadas (Admin) - Leitura
routes.get('/categories', authMiddleware, authorizeRoles('ADMIN'), menuController.getCategories); 
routes.get('/customization-groups', authMiddleware, authorizeRoles('ADMIN'), menuController.getCustomizationGroups);

// Rotas Privadas (Admin) - Criação
routes.post('/categories', authMiddleware, authorizeRoles('ADMIN'), validate(createCategorySchema), menuController.createCategory);
routes.post('/customization-groups', authMiddleware, authorizeRoles('ADMIN'), validate(batchCreateIngredientSchema), menuController.createCustomizationGroup);
routes.post('/ingredients', authMiddleware, authorizeRoles('ADMIN'), validate(createIngredientSchema), menuController.createIngredient);
routes.post('/products', authMiddleware, authorizeRoles('ADMIN'), validate(createProductSchema), menuController.createProduct);
routes.post('/products/link-group', authMiddleware, authorizeRoles('ADMIN'), validate(linkGroupToProductSchema), menuController.linkGroupToProduct);

// Rotas Privadas (Admin) - Edição (PUT)
routes.put('/categories/:id', authMiddleware, authorizeRoles('ADMIN'), validate(updateCategorySchema), menuController.updateCategory);
routes.put('/products/:id', authMiddleware, authorizeRoles('ADMIN'), validate(updateProductSchema), menuController.updateProduct);

// Rotas Privadas (Admin) - Remoção / Inativação (DELETE)
routes.delete('/products/:id', authMiddleware, authorizeRoles('ADMIN'), menuController.deleteProduct);
routes.delete('/categories/:id', authMiddleware, authorizeRoles('ADMIN'), menuController.deleteCategory);

export default routes;