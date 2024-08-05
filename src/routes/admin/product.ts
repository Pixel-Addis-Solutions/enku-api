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

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductDetail);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/attach_filters", assignFilterValuesToProduct);

export default router;
