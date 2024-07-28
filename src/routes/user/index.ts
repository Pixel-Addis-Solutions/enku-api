import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import brandRoutes from "./brand";
import authRoutes from "./auth";
import cartRoutes from "./cart";
import orderRoutes from "./order";


const router = Router();

// Register route modules
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/carts", cartRoutes);
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);


export default router;
