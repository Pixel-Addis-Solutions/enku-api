import { Router } from "express";
import { getAllDiscounts,createDiscount, deleteDiscount, updateDiscount, attachDiscountToProductOrVariationOrCategory } from "../../controllers/admin/discount";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.get("/",can(['view-Discount']), getAllDiscounts);
router.post("/", can(["create-Discount"]), createDiscount);
router.put("/:id", can(["update-Discount"]), updateDiscount);
router.delete("/:id", can(["delete-Discount"]), deleteDiscount);
router.post("/attach-discountTo-product-category-variation", can(["create-Discount"]), attachDiscountToProductOrVariationOrCategory);

export default router;
 