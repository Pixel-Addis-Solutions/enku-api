import { Router } from 'express';
import categoryRouter from './category';
import authRouter from './auth';
// import productRouter from './product';
// import variationRouter from './variation';
// import optionRouter from './option';
// import optionValueRouter from './optionValue';

const router = Router();

router.use('/categories', categoryRouter);
router.use('/auth', authRouter);
// router.use('/products', productRouter);
// router.use('/variations', variationRouter);
// router.use('/options', optionRouter);
// router.use('/option-values', optionValueRouter);

export default router;
