import { Router } from "express";
import {
  createHomePageCard,
  getAllHomePageCards,
  getHomePageCardById,
  updateHomePageCard,
  deleteHomePageCard,
} from "../../controllers/admin/home-card";

const router = Router();

router.post("/", createHomePageCard); // Create a new card
router.get("/", getAllHomePageCards); // Get all cards
router.get("/:id", getHomePageCardById); // Get a card by ID
router.put("/:id", updateHomePageCard); // Update a card by ID
router.delete("/:id", deleteHomePageCard); // Delete a card by ID

export default router;
