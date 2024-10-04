import { Router } from "express";
import { getAllDiscounts,createDiscount, deleteDiscount } from "../../controllers/admin/discount";

const router = Router();

router.get("/", getAllDiscounts);
router.post("/", createDiscount);
router.delete("/:id", deleteDiscount);

export default router;
 