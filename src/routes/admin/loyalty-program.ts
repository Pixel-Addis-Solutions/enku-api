import express from "express";
import {
  createLoyaltyProgram,
  getLoyaltyPrograms,
  getLoyaltyProgramById,
  updateLoyaltyProgram,
  deleteLoyaltyProgram,
} from "../../controllers/admin/loyalty-program";

const router = express.Router();

// Create a loyalty program
router.post("/", createLoyaltyProgram);

// Get all loyalty programs
router.get("/", getLoyaltyPrograms);

// Get a single loyalty program by ID
router.get("/:id", getLoyaltyProgramById);

// Update a loyalty program
router.put("/:id", updateLoyaltyProgram);

// Delete a loyalty program
router.delete("/:id", deleteLoyaltyProgram);

export default router;
