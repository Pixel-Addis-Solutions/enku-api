import express from 'express';
import { authenticate } from '../../middlewares/customer-login';
import { 
    createFavorite, 
    getFavorites, 
    getFavoriteCount, 
    deleteFavorite
} from '../../controllers/user/favorite';

const router = express.Router();

router.post("/", authenticate, createFavorite);
router.get("/", authenticate, getFavorites);
router.get("/count/:productId", authenticate, getFavoriteCount);
router.delete("/:favoriteId", authenticate, deleteFavorite);

export default router;