import { Router } from 'express';
import { login } from '../controllers/admin/auth';

const router = Router();

router.post('/login', login);

export default router;
