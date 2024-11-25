import { Router } from 'express';
import { changePassword, getProfile, login, updateUserInformation } from '../../controllers/admin/auth';
import { authenticateUser } from '../../middlewares/authenticate';

const router = Router();

router.post('/login', login);
router.get("/me", authenticateUser, getProfile);
router.put("/change_password", authenticateUser, changePassword);
router.put("/profile", authenticateUser, updateUserInformation);

export default router;
