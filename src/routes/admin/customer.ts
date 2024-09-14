import { Router } from "express";
import { getAllCustomers } from "../../controllers/admin/customer";

const router = Router();

router.get("/", getAllCustomers);

export default router;
