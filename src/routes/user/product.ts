import { Router } from "express";
import {
  getProductDetailById,
  getProductsByCategoryId,
  getProductsBySubCategoryId,
  getProductsBySubSubCategoryId,
  getProductsWithFilters,
  searchProducts,
} from "../../controllers/user/product";

const router = Router();

router.get("/", getProductsWithFilters);
router.get("/category/:categoryId", getProductsByCategoryId);
router.get("/sub_category/:subCategoryId", getProductsBySubCategoryId);
router.get(
  "/sub_sub_category/:subSubCategoryId",
  getProductsBySubSubCategoryId
);
router.get("/search", searchProducts);

router.get("/:productId", getProductDetailById);

export default router;
