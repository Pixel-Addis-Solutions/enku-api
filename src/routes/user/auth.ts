import { Router } from 'express';
import { registerCustomer, loginCustomer } from '../../controllers/user/customer';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

export default router;
