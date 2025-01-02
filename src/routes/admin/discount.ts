import { Router } from "express";
import { getAllDiscounts,createDiscount, deleteDiscount, updateDiscount, attachDiscountToProduct } from "../../controllers/admin/discount";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.get("/",can(['view-Discount']), getAllDiscounts);
router.post("/", can(["create-Discount"]), createDiscount);
router.put("/:id", can(["update-Discount"]), updateDiscount);
router.delete("/:id", can(["delete-Discount"]), deleteDiscount);
router.post("/attach-product", can(["create-Discount"]), attachDiscountToProduct);

export default router;
 