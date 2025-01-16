import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import brandRoutes from "./brand";
import authRoutes from "./auth";
import cartRoutes from "./cart";
import orderRoutes from "./order";
import cardRoutes from "./card";
import blogRoutes from "./blog";
import discountRoutes from "./discount";
import PostRoutes from "./post";
import {
  getFilters,
  getFiltersForCategory,
} from "../../controllers/user/filter";
import { getHomePageData } from "../../controllers/user/home";
import loyaltyProgramsRoutes from "./loyalty-program";

const router = Router();

// Register route modules
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/carts", cartRoutes);
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/filters/:categoryId", getFiltersForCategory);
router.use("/filters", getFilters);
router.use("/home", getHomePageData);
router.use("/loyalty_programs", loyaltyProgramsRoutes);
router.use("/cards", cardRoutes);
router.use("/discounts", discountRoutes);
router.use("/posts", PostRoutes);
router.use("/", blogRoutes);
 
export default router;
