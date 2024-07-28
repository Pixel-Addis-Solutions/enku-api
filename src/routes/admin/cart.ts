import { Router } from 'express';
import { getAllCarts, getCartById } from '../../controllers/admin/cart';

const router = Router();

router.get('/', getAllCarts);
router.get('/:id', getCartById);

export default router;
