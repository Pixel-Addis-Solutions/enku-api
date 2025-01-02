import express from "express";
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "../../controllers/admin/testimonial";
import { can } from "../../middlewares/authenticate";
const router = express.Router();

router.post("/",can(['create-Testimony']), createTestimonial); // Create a testimonial
router.get("/", can(["view-Testimony"]), getAllTestimonials); // Get all testimonials
router.get("/:id", can(["view-Testimony"]), getTestimonialById); // Get a single testimonial by ID
router.put("/:id", can(["update-Testimony"]), updateTestimonial); // Update a testimonial by ID
router.delete("/:id", can(["delete-Testimony"]), deleteTestimonial); // Delete a testimonial by ID

export default router;
