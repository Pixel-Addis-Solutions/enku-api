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
import { can } from "../../middlewares/authenticate";
const router = Router();

router.get("/",can(['view-product']), getProducts);

router.get("/:top-selling", can(["view-product"]), getTopSellingProducts);
router.get("/:id", can(["view-product"]), getProductDetail);
router.post("/", can(["create-product"]), createProduct);
router.put("/:id", can(["update-product"]), updateProduct);
router.delete("/:id", can(["delete-product"]), deleteProduct);
router.post( "/attach_filters", can(["create-product"]),assignFilterValuesToProduct);

export default router;
