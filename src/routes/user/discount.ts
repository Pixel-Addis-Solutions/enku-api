import express from "express";
import { getAllUserDiscounts } from "../../controllers/user/discount";

const router = express.Router();

// Get all loyalty programs
router.get("/", getAllUserDiscounts);

export default router;
