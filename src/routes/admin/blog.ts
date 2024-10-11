import { Router } from "express";
import { BlogController } from "../../controllers/admin/blog";

const router = Router();

router.get("/", BlogController.getAll); // Fetch all
router.get("/:id", BlogController.getById); // Fetch a blog by ID
router.post("/", BlogController.create); // Create a new blog
router.put("/:id", BlogController.update); // Update an existing blog
router.delete("/:id", BlogController.delete); // Delete a blog by ID

export default router;
