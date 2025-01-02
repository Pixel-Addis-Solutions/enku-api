import { Router } from "express";
import {
  RoleController,
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../../controllers/admin/role";

const router = Router();

// Assign permissions to a role..
router.post("/:id/permissions", RoleController.assignPermissions);

// Retrieve permissions for a specific role...
router.get("/:id/permissions", RoleController.getRolePermissions);

// //role Crude Operation
router.post("/", createRole); //to create role
router.get("/", getAllRoles); //to get role
router.get("/:id", getRoleById); //to get role by Id role
router.put("/:id", updateRole); //to update role
router.delete("/:id", deleteRole); //to delete role

export default router;
