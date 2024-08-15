import { Router } from "express";

import { createFilter, deleteFilter, getCategoriesWithFilters, getFilters, getFiltersByCategory } from "../../controllers/admin/filter";

const router = Router();

router.post("/", createFilter);
router.get("/", getFilters);
router.get("/filterId", getFilters);
router.delete("/:id", deleteFilter);
router.get("/category/:categoryId", getFiltersByCategory);
router.get("/categories_with_filters", getCategoriesWithFilters);
export default router;
