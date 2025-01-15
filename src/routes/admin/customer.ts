import { Router } from "express";
import { getAllCustomers } from "../../controllers/admin/customer";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.get("/", can(['view-Customer']),getAllCustomers);

export default router;
