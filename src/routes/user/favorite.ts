import express from 'express';
import { authenticate } from '../../middlewares/customer-login';
import { createFavorite, getFavorites,getFavoriteCount} from '../../controllers/user/favorite';


const router = express.Router();

router.post("/", authenticate, createFavorite);
router.get("/", authenticate, getFavorites);
router.get("/count/:productId", authenticate, getFavoriteCount);

export default router;