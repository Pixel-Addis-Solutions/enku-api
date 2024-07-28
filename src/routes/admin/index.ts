import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import brandRoutes from "./brand";
import subCategoryRoutes from "./sub-category";
import subSubCategoryRoutes from "./sub-sub-category";
import authRoutes from "./auth";
import orderRoutes from "./order";
import cartRoutes from "./cart";

const router = Router();

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/sub_categories", subCategoryRoutes);
router.use("/sub_sub_categories", subSubCategoryRoutes);
router.use("/auth", authRoutes);
router.use("/brands", brandRoutes);
router.use("/orders", orderRoutes);
router.use("/carts", cartRoutes);

export default router;
