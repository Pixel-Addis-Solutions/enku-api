// src/routes/sub-sub-category.ts
import { Router } from 'express';
import { createSubSubCategory, getSubSubCategories, getSubSubCategoryById, updateSubSubCategory, deleteSubSubCategory } from '../../controllers/admin/sub-sub-category';
import { can } from "../../middlewares/authenticate";
const router = Router();

router.post('/',can(['create-SubSubCategory']), createSubSubCategory);
router.get("/", can(["view-SubSubCategory"]), getSubSubCategories);
router.get("/:id", can(["view-SubSubCategory"]), getSubSubCategoryById);
router.put("/:id", can(["update-SubSubCategory"]), updateSubSubCategory);
router.delete("/:id", can(["delete-SubSubCategory"]), deleteSubSubCategory);

export default router;
