import { Router } from "express";
import { getDashboardData } from "../../controllers/admin/dashboard";

const router = Router();

router.get("/part_one", getDashboardData);

export default router;
