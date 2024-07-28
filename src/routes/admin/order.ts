import { Router } from 'express';
import { getAllOrders, updateOrderStatus,getOrderById } from '../../controllers/admin/order';

const router = Router();

router.get('/', getAllOrders);
router.put('/:id', updateOrderStatus);
router.get('/:id', getOrderById);

export default router;

