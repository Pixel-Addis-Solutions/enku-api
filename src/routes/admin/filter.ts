import { Router } from "express";

import { createFilter, getFilters } from "../../controllers/admin/filter";

const router = Router();

router.post("/", createFilter);
router.get("/", getFilters);
export default router;
