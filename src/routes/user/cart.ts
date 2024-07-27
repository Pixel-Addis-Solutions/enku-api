import { Router } from "express";
import {
  addToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
} from "../../controllers/user/cart";
import { authenticate } from "../../middlewares/customer-login";

const router = Router();

router.post("/", authenticate, addToCart); // Add item to cart
router.get("/", authenticate, getCartItems); // Get all cart items
router.put("/", updateCartItem); // Update cart item quantity
router.delete("/:id", removeCartItem); // Remove item from cart

export default router;
