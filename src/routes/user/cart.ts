import { Router } from 'express';
import { addToCart, getCartItems, updateCartItem, removeCartItem } from '../../controllers/user/cart';

const router = Router();

router.post('/', addToCart); // Add item to cart
router.get('/', getCartItems); // Get all cart items
router.put('/', updateCartItem); // Update cart item quantity
router.delete('/', removeCartItem); // Remove item from cart

export default router;
