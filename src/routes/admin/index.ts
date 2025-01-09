import { Router } from "express";
import productRoutes from "./product";
import categoryRoutes from "./category";
import brandRoutes from "./brand";
import subCategoryRoutes from "./sub-category";
import subSubCategoryRoutes from "./sub-sub-category";
import authRoutes from "./auth";
import orderRoutes from "./order";
import cartRoutes from "./cart";
import filterRoutes from "../admin/filter";
import filterValueRoutes from "../admin/filter-value";
import carouselRoutes from "../admin/carousel";
import customerRoutes from "../admin/customer";
import dashboardRoutes from "../admin/dashboard";
import blogRoutes from "../admin/blog";
import roleRoutes from "../admin/role";
import usersRoutes from "../admin/users";
import cardRoutes from "../admin/card";
import discountRoutes from "../admin/discount";
import testimonialsRoutes from "../admin/testimonial";
import loyaltyProgramsRoutes from "../admin/loyalty-program";
import productVariationRoutes from "./Variation";
import { deleteProductImage } from "../../controllers/admin/product";
import { authenticateUser } from "../../middlewares/authenticate";


const router = Router();

router.use("/products", authenticateUser,productRoutes);
router.use("/categories", authenticateUser,categoryRoutes);
router.use("/sub_categories", authenticateUser,subCategoryRoutes);
router.use("/sub_sub_categories", authenticateUser,subSubCategoryRoutes);
router.use("/auth", authRoutes);
router.use("/brands", authenticateUser, brandRoutes);
router.use("/orders",authenticateUser,orderRoutes);
router.use("/carts", authenticateUser,cartRoutes);
router.use("/filters", authenticateUser,filterRoutes);
router.use("/filter_values", authenticateUser,filterValueRoutes);
router.use("/carousels", authenticateUser,carouselRoutes);
router.use("/customers", authenticateUser,customerRoutes);
router.use("/users", authenticateUser,usersRoutes);
router.use("/blogs", authenticateUser,blogRoutes);
router.use("/roles", authenticateUser,roleRoutes);
router.use("/cards", authenticateUser,cardRoutes);
router.use("/discounts", authenticateUser,discountRoutes);
router.use("/testimonials", authenticateUser,testimonialsRoutes);
router.use("/loyalty_programs", authenticateUser,loyaltyProgramsRoutes);
router.use("/variations", productVariationRoutes);
router.delete("/images/:id", authenticateUser,deleteProductImage);


export default router;
 