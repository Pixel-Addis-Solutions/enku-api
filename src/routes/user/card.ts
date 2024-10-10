import { Router } from "express";
import { getAllHomePageCards } from "../../controllers/admin/home-card";

const router = Router();

router.get("/", getAllHomePageCards); // Get all cards

export default router;
