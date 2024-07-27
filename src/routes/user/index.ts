import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import brandRoutes from "./brand";
import authRoutes from "./auth";
import cartRoutes from "./cart";


const router = Router();

// Register route modules
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/carts", cartRoutes);
router.use("/auth", authRoutes);


export default router;
