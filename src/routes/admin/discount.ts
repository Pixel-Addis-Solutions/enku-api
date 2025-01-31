import { Router } from "express";
import { getAllDiscounts,createDiscount, deleteDiscount, updateDiscount} from "../../controllers/admin/discount";

const router = Router();

router.get("/", getAllDiscounts);
router.post("/", createDiscount);
router.put("/:id", updateDiscount);
router.delete("/:id", deleteDiscount);
// router.post("/attach-product", attachDiscountToProduct);

export default router;
 