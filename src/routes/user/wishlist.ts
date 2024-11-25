import { Router } from 'express';
import { addProductToWishlist, removeProductFromWishlist, getWishlist } from '../../controllers/user/wishlist';
import { authenticateCustomer } from '../../middlewares/authenticate';

const router = Router();

router.post('/', authenticateCustomer, addProductToWishlist);
router.delete('/:id', authenticateCustomer, removeProductFromWishlist);
router.get('/', authenticateCustomer, getWishlist);

export default router;
