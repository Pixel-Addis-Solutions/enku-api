import { Router } from 'express';
import { getProductDetailById, getProductsByCategoryId, getProductsBySubCategoryId, getProductsBySubSubCategoryId } from '../../controllers/user/product';

const router = Router();

router.get('/category/:categoryId', getProductsByCategoryId);
router.get('/sub_category/:subCategoryId', getProductsBySubCategoryId);
router.get('/sub_sub_category/:subSubCategoryId', getProductsBySubSubCategoryId);
router.get('/:productId', getProductDetailById);

export default router;
