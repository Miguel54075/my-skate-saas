import { Router } from 'express';
import menuController from '../controllers/menuController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validation.js';
import {
  createCategorySchema,
  createProductSchema,
  batchCreateIngredientSchema,
  createIngredientSchema,
  linkGroupToProductSchema,
} from '../schemas/menuSchemas.js';

const routes = Router();

// Rotas GET e POST existentes...
routes.get('/public/:slug', menuController.getPublicMenu);
routes.get('/categories', authMiddleware, authorizeRoles('ADMIN'), menuController.getCategories); 
routes.get('/customization-groups', authMiddleware, authorizeRoles('ADMIN'), menuController.getCustomizationGroups);

routes.post('/categories', authMiddleware, authorizeRoles('ADMIN'), validate(createCategorySchema), menuController.createCategory);
routes.post('/customization-groups', authMiddleware, authorizeRoles('ADMIN'), validate(batchCreateIngredientSchema), menuController.createCustomizationGroup);
routes.post('/ingredients', authMiddleware, authorizeRoles('ADMIN'), validate(createIngredientSchema), menuController.createIngredient);
routes.post('/products', authMiddleware, authorizeRoles('ADMIN'), validate(createProductSchema), menuController.createProduct);
routes.post('/products/link-group', authMiddleware, authorizeRoles('ADMIN'), validate(linkGroupToProductSchema), menuController.linkGroupToProduct);

// --- ADICIONE/CONFIRME ESTAS DUAS ROTAS DELETE ABAIXO ---
routes.delete('/products/:id', authMiddleware, authorizeRoles('ADMIN'), menuController.deleteProduct);
routes.delete('/categories/:id', authMiddleware, authorizeRoles('ADMIN'), menuController.deleteCategory);

export default routes;