import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validation.js';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/orderSchemas.js';
import orderController from '../controllers/orderController.js';

const routes = Router();

routes.post('/public', validate(createOrderSchema), orderController.createOrder);

routes.get('/admin', authMiddleware, authorizeRoles('ADMIN', 'STAFF'), orderController.getTenantOrders);
routes.patch('/admin/:id/status', authMiddleware, authorizeRoles('ADMIN', 'STAFF'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

routes.delete('/admin/:id', authMiddleware, authorizeRoles('ADMIN'), orderController.deleteOrder);

export default routes;