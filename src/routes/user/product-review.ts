import express from "express";
import {
  createReview,
  getAllReviews,
  getAverageRating,
} from "../../controllers/user/product-review";

const router = express.Router();

router.post("/reviews", createReview);
router.get("/reviews/:productId", getAllReviews);
router.get("/reviews/:productId/average-rating", getAverageRating);

export default router;