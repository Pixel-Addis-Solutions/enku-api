import { Router } from "express";
import { getAllDiscounts,createDiscount } from "../../controllers/admin/discount";

const router = Router();

router.get("/", getAllDiscounts);
router.post("/", createDiscount);

export default router;
 