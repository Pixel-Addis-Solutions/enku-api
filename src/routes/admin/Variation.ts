import { Router } from 'express';
import { deleteProductVariations, updateProductVariation } from '../../controllers/admin/variation';

const router = Router();

router.delete('/products/:productId', deleteProductVariations);
router.put('/products/:productId', updateProductVariation);

export default router;