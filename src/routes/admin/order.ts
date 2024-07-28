import { Router } from 'express';
import { getOrders, updateOrderStatus } from '../../controllers/admin/order';

const router = Router();

router.get('/', getOrders);
router.put('/:id', updateOrderStatus);

export default router;
