import express from "express";
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "../../controllers/admin/testimonial";

const router = express.Router();

router.post("/", createTestimonial); // Create a testimonial
router.get("/", getAllTestimonials); // Get all testimonials
router.get("/:id", getTestimonialById); // Get a single testimonial by ID
router.put("/:id", updateTestimonial); // Update a testimonial by ID
router.delete("/:id", deleteTestimonial); // Delete a testimonial by ID

export default router;
