import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../controllers/admin/User"; // Adjust the path as per your project structure

const router = Router();

// Create a new user
router.post("/", createUser);

// Get all users
router.get("/", getAllUsers);

// Get a specific user by ID
router.get("/:id", getUserById);

// Update a user
router.put("/:id", updateUser);

// Delete a user
router.delete("/:id", deleteUser);

export default router;