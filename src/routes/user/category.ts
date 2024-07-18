import { Router } from "express";

import { getCategoriesWithSubcategories } from "../../controllers/user/category";

const router = Router();

router.get("/", getCategoriesWithSubcategories);
export default router;
