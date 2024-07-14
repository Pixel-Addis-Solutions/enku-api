import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import subCategoryRoutes from "./sub-category";
import brandRoutes from "./";

const router = Router();

// Register route modules
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/sub_categories", subCategoryRoutes);
// router.use("/brands", brandRoutes);

export default router;
