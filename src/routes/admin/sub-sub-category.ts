// src/routes/sub-sub-category.ts
import { Router } from 'express';
import { createSubSubCategory, getSubSubCategories, getSubSubCategoryById, updateSubSubCategory, deleteSubSubCategory } from '../../controllers/admin/sub-sub-category';

const router = Router();

router.post('/', createSubSubCategory);
router.get('/', getSubSubCategories);
router.get('/:id', getSubSubCategoryById);
router.put('/:id', updateSubSubCategory);
router.delete('/:id', deleteSubSubCategory);

export default router;
