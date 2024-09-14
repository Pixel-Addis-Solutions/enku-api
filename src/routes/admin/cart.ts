import { Router } from 'express';
import { getAllCarts, getCartById, removeCart } from '../../controllers/admin/cart';

const router = Router();

router.get('/', getAllCarts);
router.get('/:id', getCartById);
router.delete('/:id', removeCart);

export default router;
