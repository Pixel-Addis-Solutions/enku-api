import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import brandRoutes from "./brand";
import authRoutes from "./auth";
import cartRoutes from "./cart";
import orderRoutes from "./order";
import { getFiltersByCategory } from "../../controllers/admin/filter";


const router = Router();

// Register route modules
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/carts", cartRoutes);
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/filters/:categoryId", getFiltersByCategory);


export default router;
