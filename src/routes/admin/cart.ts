import { Router } from 'express';
import { getAllCarts, getCartById, removeCart } from '../../controllers/admin/cart';
import { can } from "../../middlewares/authenticate";

const router = Router();

router.get('/',can(['view-Cart']), getAllCarts);
router.get("/:id", can(["view-Cart"]), getCartById);
router.delete("/:id", can(["delete-Cart"]), removeCart);

export default router;
