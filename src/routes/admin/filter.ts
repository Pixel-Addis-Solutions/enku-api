import { Router } from "express";

import { createFilter, deleteFilter, getCategoriesWithFilters, getFilters, getFiltersByCategory } from "../../controllers/admin/filter";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.post("/",can(['create-Filter']), createFilter);
router.get("/", can(["view-Filter"]), getFilters);
router.get("/filterId", can(["view-Filter"]), getFilters);
router.delete("/:id", can(["delete-Filter"]), deleteFilter);
router.get(
  "/category/:categoryId",
  can(["view-Filter"]),
  getFiltersByCategory
);
router.get(
  "/categories_with_filters",
  can(["view-Filter"]),
  getCategoriesWithFilters
);
export default router;
