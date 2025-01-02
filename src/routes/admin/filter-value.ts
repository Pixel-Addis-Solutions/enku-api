import { Router } from "express";

import { createFilterValue, deleteFilterValue } from "../../controllers/admin/filter";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.post("/", can(['create-FilterValue']),createFilterValue);
router.delete("/:id", can(["delete-FilterValue"]), deleteFilterValue);

export default router;
