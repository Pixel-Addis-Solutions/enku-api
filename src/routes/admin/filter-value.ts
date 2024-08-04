import { Router } from "express";

import { createFilterValue } from "../../controllers/admin/filter";

const router = Router();

router.post("/", createFilterValue);
export default router;
