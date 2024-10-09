import express from "express";
import { getLoyaltyPrograms } from "../../controllers/user/loyalty-program";

const router = express.Router();


// Get all loyalty programs
router.get("/", getLoyaltyPrograms);

export default router;
