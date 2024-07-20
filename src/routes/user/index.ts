import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import brandRoutes from "./brand";


const router = Router();

// Register route modules
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);


export default router;
