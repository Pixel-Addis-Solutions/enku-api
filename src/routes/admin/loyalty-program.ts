import express from "express";
import {
  createLoyaltyProgram,
  getLoyaltyPrograms,
  getLoyaltyProgramById,
  updateLoyaltyProgram,
  deleteLoyaltyProgram,
} from "../../controllers/admin/loyalty-program";
import { can } from "../../middlewares/authenticate";
const router = express.Router();

// Create a loyalty program
router.post("/",can(['create-LoyalityProgram']), createLoyaltyProgram);

// Get all loyalty programs
router.get("/", can(["view-LoyalityProgram"]), getLoyaltyPrograms);

// Get a single loyalty program by ID
router.get("/:id", can(["view-LoyalityProgram"]), getLoyaltyProgramById);

// Update a loyalty program
router.put("/:id", can(["update-LoyalityProgram"]), updateLoyaltyProgram);

// Delete a loyalty program
router.delete("/:id", can(["delete-LoyalityProgram"]), deleteLoyaltyProgram);

export default router;
