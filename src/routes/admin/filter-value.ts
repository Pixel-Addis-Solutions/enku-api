import { Router } from "express";

import { createFilterValue, deleteFilterValue } from "../../controllers/admin/filter";

const router = Router();

router.post("/", createFilterValue);
router.delete("/:id", deleteFilterValue);

export default router;
