import express from 'express';
import { authenticate } from '../../middlewares/customer-login';
import { 
    createFavorite, 
    getFavorites, 
    getFavoriteCount, 
    getProductReviews,
    getProductAverageRating
} from '../../controllers/user/favorite';

const router = express.Router();

router.post("/", authenticate, createFavorite);
router.get("/", authenticate, getFavorites);
router.get("/count/:productId", authenticate, getFavoriteCount);
router.get("/reviews/:productId",authenticate, getProductReviews);
router.get("/reviews/rating/:productId",authenticate, getProductAverageRating);

export default router;