import { Router } from "express";

import { getBrands } from "../../controllers/user/brands";

const router = Router();

router.get("/", getBrands);
export default router;
