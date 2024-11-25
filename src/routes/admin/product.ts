import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetail,
  assignFilterValuesToProduct,
} from "../../controllers/admin/product";
import { getTopSellingProducts } from "../../controllers/admin/dashboard";

const router = Router();

router.get("/", getProducts);

router.get("/:top-selling", getTopSellingProducts);
router.get("/:id", getProductDetail);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/attach_filters", assignFilterValuesToProduct);

export default router;
