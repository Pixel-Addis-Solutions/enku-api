import { Router } from "express";
import {
  getBlogDetail,
  getBlogTips,
  getBlogVideos,
} from "../../controllers/user/blog";

const router = Router();

router.get("/tips", getBlogTips); // Fetch all
router.get("/videos", getBlogVideos); // Fetch all
router.get("/tips/:id", getBlogDetail); // Fetch a blog by ID
router.get("/videos/:id", getBlogDetail); // Fetch a blog by ID

export default router;
