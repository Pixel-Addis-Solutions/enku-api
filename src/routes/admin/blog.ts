// import { Router } from "express";
// import { BlogController } from "../../controllers/admin/blog";

// const router = Router();

// router.get("/", BlogController.getAll); // Fetch all
// router.get("/:id", BlogController.getById); // Fetch a blog by ID
// router.post("/", BlogController.create); // Create a new blog
// router.put("/:id", BlogController.update); // Update an existing blog
// router.delete("/:id", BlogController.delete); // Delete a blog by ID;
// export default router;

import { Router } from "express";
import { BlogController } from "../../controllers/admin/blog";
import { can } from "../../middlewares/authenticate"; // Import the middleware

const router = Router();

// Admin routes with permissions
router.get("/", can(["view-Blog"]), BlogController.getAll); // Fetch all blogs
router.get("/:id", can(["view-Blog"]), BlogController.getById); // Fetch a blog by ID
router.post("/", can(["create-Blog"]), BlogController.create); // Create a new blog
router.put("/:id", can(["update-Blog"]), BlogController.update); // Update an existing blog
router.delete("/:id", can(["delete-Blog"]), BlogController.delete); // Delete a blog by ID

export default router;
