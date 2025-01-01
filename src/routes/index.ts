import { Router } from "express";
import userRoutes from "./user/index";
import adminRoutes from "./admin/index";
import fileRoutes from "./file";
import roleRoutes from "./role";

const router = Router();

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/files", fileRoutes);
router.use("/api/roles", roleRoutes);
export default router;
