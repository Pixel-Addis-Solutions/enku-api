import { Router } from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getAllPermissions,
  assignPermissions,
  getRolePermissions,
} from "../../controllers/admin/role";

const router = Router();

// Assign permissions to a role
router.post("/:id/permissions", assignPermissions);

// Retrieve permissions for a specific role
router.get("/:id/permissions", getRolePermissions);
router.get("/permissions", getAllPermissions); // Get all permissions

// Role CRUD Operations
router.post("/", createRole); // Create role
router.get("/", getAllRoles); // Get all roles
router.get("/:id", getRoleById); // Get role by ID
router.put("/:id", updateRole); // Update role
router.delete("/:id", deleteRole); // Delete role

export default router;
