import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import subCategoryRoutes from "./sub-category";
import subSubCategoryRoutes from "./sub-sub-category";

const router = Router();

// Register route modules
router.use("/admin/products", productRoutes);
router.use("/admin/categories", categoryRoutes);
router.use("/admin/sub_categories", subCategoryRoutes);
router.use("/admin/sub_sub_categories", subSubCategoryRoutes);
// router.use("/brands", brandRoutes);

export default router;
