import { Router } from "express";
import {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
} from "../../controllers/admin/sub-category";
import { can } from "../../middlewares/authenticate";
const router = Router();

router.post("/",can(['create-SubCategory']), createSubCategory);
router.get("/", can(["view-SubCategory"]), getSubCategories);
router.get("/:id", can(["view-SubCategory"]), getSubCategoryById);
router.put("/:id", can(["update-SubCategory"]), updateSubCategory);
router.delete("/:id", can(["delete-SubCategory"]), deleteSubCategory);

export default router;
