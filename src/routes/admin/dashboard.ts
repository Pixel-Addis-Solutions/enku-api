import { Router } from "express";
import { getDashboardData } from "../../controllers/admin/dashboard";
import { can } from "../../middlewares/authenticate";

const router = Router();

router.get("/part_one",can(['view-Dashboard']), getDashboardData);

export default router;
