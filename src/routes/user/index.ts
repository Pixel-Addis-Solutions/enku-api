import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";


const router = Router();

// Register route modules
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);


export default router;
