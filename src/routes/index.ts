import { Router } from "express";
import userRoutes from "./user/index";
import adminRoutes from "./admin/index";
import fileRoutes from "./file";

const router = Router();

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/files", fileRoutes);
 
export default router;
